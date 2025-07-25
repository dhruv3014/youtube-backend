import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { deleteFromCloudinary } from "../utils/DeleteFileFromCloudinary.js"
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false}) // if we don't use validateBeforeSave then everytime we save through user.save() it also kickin the mongoose models like password means everytime we save we need to give password then only it will save. So to avoid that we set validatBeforeSave as false.

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    
    // console.log(req.body);  // data coming as in 'form or json' format then data will be found in 'req.body'
    
    // 1. get user details from frontend
    const {fullName, email, username, password} = req.body
    // console.log("email: ", email);

    // 2. validation - not empty
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    
    // 3. check if user already exists: username, email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    
    // 4. check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path; // here we get req.files due multer middleware applied in user.routes.js file and use avatar[0] because it gives an object through which we can get path of the file.
    // below we wrote diffrent way to get coverImageLocalPath because since we have not any required condition for coverImage upload so if don't send an image in postman for coverImage it will give error but using this different way solves that problem
    // const coverImageLocalPath = req.files?.coverImage?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    // console.log(req.files);
    
    
    // 5. upload them to cloudinary, avatar check
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required!!")
    }

    // 6. create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // 7. remove password and refresh token field from response
    // Mongodb adds _.id in every entry
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // 8. check user creation
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // 9. return response(res)
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )

    // steps for User Registration  Backend:
    // 1. get user details from frontend
    // 2. validation - not empty
    // 3. check if user already exists: username, email
    // 4. check for images, check for avatar
    // 5. upload them to cloudinary, avatar check
    // 6. create user object - create entry in db
    // 7. remove password and refresh token field from response
    // 8. check user creation
    // 9. return response(res)
})

const loginUser = asyncHandler( async (req, res) => {
    // 1. req body -> data
    // 2. username and email are required
    // 3. find the user through username and email
    // 4. password check
    // 5. access and refresh token
    // 6. remove password and refresh token from response
    // 7. send cookie and response
    
    // 1. req body -> data
    // 2. username or email should be unique
    const {email, username, password} = req.body
    if (!username && !email) {   // or  if (!(username || email)) {
        throw new ApiError(400, "username and email is required")
    }
    
    // 3. find the user through username and email
    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    if (!user) {
        throw new ApiError(404, "User does not exist")
    }
    
    // 4. password check
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }
    
    // 5. access and refresh token
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    
    // 6. remove password and refresh token from response
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    
    // 7. send cookie and response
    // since by default cookies can modified by anyone but after setting below features cookies are now only  modified by server. 
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken // since we send accessToken and refreshToken in cookies then why are we sending it again through response? because maybe user wants to save this information in their localstorage due to their reasons or since cookies is not stored/set in developing mobile application. Therefore it is good practice to send it as response
            },
            "User logged in Successfully"
        )
    )
})

const logoutUser = asyncHandler (async (req, res) => {
    // here we just have to do two things: 
    // 1. reset refreshToken
    // 2. remove cookies
    
    // 1. reset/remove refreshToken
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
                // here if we set null then also it will work but should not use null for response it's not a good practice
            }
        },
        {
            new: true  // due to this we will get updated values on return response
        }
    )
    
    // 2. remove cookies
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User Logged Out Successfully"))
})

const refreshAccessToken = asyncHandler ( async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request")
        }
        
        // Note: tokens in cookies are stored in encoded form to decode and verify it we use '.verify()' method.
        // to get more info: https://jwt.io/
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Ivalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const options = {
            httpOnlt: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newRefreshToken, options).json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "access token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler( async (req, res) => {
    const {oldPassword, newPassword} = req.body  

    // const {oldpassword, newPassword, confPassword} = req.body
    
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }
    // if (!(newPassword === confPassword)) { throw new ApiError(400, "New password and confirm password do not match") }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    )
})

const getCurrentUser = asyncHandler( async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user, "Current user fetched successfully")
    )
})

const updateAccountDetails = asyncHandler ( async (req, res) => {
    const {fullName, email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,  // or fullName: fullName
                email: email
            }
        }, 
        {new: true}
    ).select("-password")

    return res.status(200).json(
        new ApiResponse(200, user, "Accounnt details updated successfully")
    )
})

const updateUserAvatar = asyncHandler ( async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    // Getting old avatar URL
    const fetchingOldAvatar = await User.findById(req.user?._id).select("avatar");
    const oldAvatarPublicId = extractPublicIdFromUrl(fetchingOldAvatar.avatar);

    // Upload new avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }

    // Update user
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    // Delete old avatar
    try {
        await deleteFromCloudinary(oldAvatarPublicId)
    } catch (error) {
        console.error("Failed to delete old avatar: ", error);
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Avatar updated successfully")
    )
})

const updateUserCoverImage = asyncHandler ( async (req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, "coverImage file is missing")
    }

    // Getting old avatar URL
    const fetchingOldCoverImage = await User.findById(req.user?._id).select("avatar");
    const oldCoverImagePublicId = extractPublicIdFromUrl(fetchingOldCoverImage.avatar);

    // Uploading new coverImage
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on coverImage")
    }

    // Update user
    const  user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    // Delete old avatar
    try {
        await deleteFromCloudinary(oldCoverImagePublicId)
    } catch (error) {
        console.error("Failed to delete old avatar: ", error);
    }

    return res.status(200).json(
        new ApiResponse(200, user, "coverImage updated successfully")
    )
})

const getUserChannelProfile = asyncHandler ( async (req, res) => {
    const {username} = req.params  // taking data from an URL
    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }
    
    // when a user subscribe a channel a document is created mentioning user(channel) and user(subscriber) so here to find no. of subscriber in channel we need to search for docs.mentioning that channel not the subscriber and to find no. of channel a user is subscribedTo we need to search for docs. mentioning that user. So here thing are like opposite.
    // learn aggregation operators : https://www.mongodb.com/docs/manual/reference/operator/aggregation-pipeline/
    const channel = await User.aggregate([
        {
            // finds out that specific user data
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions", // since in mongodb names became plural annd in lowercase
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {   
            $lookup: {
                from: "subscriptions", 
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }  
        },
        {
            $addFields: {
                subcribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in : [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subcribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])
    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res.status(200).json(
        new ApiResponse(200, channel[0], "User channel fetcheed successfully")
    )
})

const getWatchHistory = asyncHandler ( async (req, res) => {
    const userId = req.user._id  
    const user = await User.aggregate([
        {
            $match: {
                _id: userId // _id: new mongoose.Types.ObjectId(req.params._id)   // not working through req.params._id
                // since _id is given stored as "_id: ObjectId('hwefh387rpr7r893ffh89hdc')", but doing req.params._id will give only inner part 'hwefh387rpr7r893ffh89hdc'. This was not a problem when the _id is stored in a variable because sort this things all out but while writting aggregate pipelines this is not allowed(mongoose don't sort this out) so we need to write _id as '_id: new mongoose.Types.Object(req.params._id)'.
            }
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'watchHistory',
                foreignField: '_id',
                as: 'watchHistory',
                pipeline: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'owner',
                            foreignField: '_id',
                            as: 'owner',
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                },
                                {
                                    $addFields: {
                                        // this will overwrite the existing owner field
                                        owner: {
                                            $first: "$owner"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, user[0].watchHistory, "Watch History Fetched Successfully")
    )
})

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}
