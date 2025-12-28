const cloudinary = require("cloudinary").v2;

async function uploadImage(imagePath) {
    try {
        const result = await cloudinary.uploader.upload(imagePath, {
            folder: "inventory-mgmt-postgresql",  
        });
        console.log("Image uploaded successfully:", result); 
        return result;
    } catch (error) {
        console.error("Error uploading image:", error);  
        throw error;  
    }
}

async function deleteImagefromCloudinary(publicId) {
    try {
        console.log("Attempting to delete image with public ID:", publicId); 
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Cloudinary delete result:", result); 
        if (result.result === 'ok') {
            console.log("Image deleted successfully from Cloudinary");
        } else {
            console.error("Failed to delete image from Cloudinary:", result);
            throw new Error("Failed to delete image from Cloudinary");
        }
    } catch (error) {
        console.error("Error deleting image from Cloudinary:", error); 
        throw error; 
    }
}

module.exports = { uploadImage, deleteImagefromCloudinary };
