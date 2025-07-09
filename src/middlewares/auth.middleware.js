import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"

// This middleware just verify that if user exists or not
export const verifyJWT = asyncHandler (async (req, _, next) => { // if any parameter is not not used then write '_' instead of the parameter. This type of things is seen in production codes
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")  // here we check if cookie(like cookie?) is there or not because mobile application users don't have cookies
        // if there are no cookie then we check 'req.header("Authorization")'(we pass token through header in postman as 'key = Authorization and value = Bearer <token>' shows like Authorization: Bearer <token>) then add '.replace("Bearer ", "")' (this replaces "Bearer " with "") method so we will get 'token' not the 'Bearer <token>'.(here token is access token)
    
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access Token")
    }
})