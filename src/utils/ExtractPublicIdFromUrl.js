import { ApiError } from "./ApiError.js";

// Imagine you have this Cloudinary URL:
// https://res.cloudinary.com/demo-cloud/image/upload/v1712345678/folder1/folder2/my-cat_picture.jpg

const extractPublicIdFromUrl = (url) => {
  if (!url) {
    throw new ApiError(400, "Cloudinary URL not Found !!")
  };
  try {
    const parts = url.split('/'); // ["https:", "", "res.cloudinary.com", "demo-cloud", "image", "upload", "v1712345678", "folder1", "folder2", "my-cat_picture.jpg"]
    const uploadIndex = parts.indexOf('upload');  // Returns 5
    if (uploadIndex === -1) {
        throw new ApiError(400, "Wrong URL no upload part found !!")
    };
    
    const afterUpload = parts.slice(uploadIndex + 1); // ["v1712345678", "folder1", "folder2", "my-cat_picture.jpg"]
    // Check if first part is a version (like "v123...")
    if (/^v\d+$/.test(afterUpload[0])) {
    afterUpload.shift(); // Remove version part
    }
    // ["folder1", "folder2", "my-cat_picture.jpg"]
    
    let publicId = afterUpload.join('/'); // "folder1/folder2/my-cat_picture.jpg"
    publicId = publicId.replace(/\.[^/.]+$/, ""); // Remove extension // Result: "folder1/folder2/my-cat_picture"
    return publicId; // "folder1/folder2/my-cat_picture"
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
};

export { extractPublicIdFromUrl }