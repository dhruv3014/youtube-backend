import {v2 as cloudinary} from "cloudinary"
import fs from "fs" // 'fs' is file system which comes by default from nodejs.

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_KEY, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

// Note : JPG file are not supported by cloudinary passing them through postman will give error whereas JPEG and PNG will not give error
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfully
        // console.log("file is uploaded on cloudinary", response.url);
        // console.log("file is uploaded on cloudinary", response);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed

        //return ApiError(400, "Something went wrong file Uploadinng Failed !!!");  written by myself hahahahahaha!!
        return null;
    }
}

export { uploadOnCloudinary }