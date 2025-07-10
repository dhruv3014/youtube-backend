import { v2 as cloudinary } from 'cloudinary';
import { ApiError } from './ApiError.js';

export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
        throw new ApiError(400, "No PublicId Found !!")
    };
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("File Successfully Deleted from Cloudinary");
    return result;
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    return null;
  }
};