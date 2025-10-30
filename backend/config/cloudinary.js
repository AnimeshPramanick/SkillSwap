const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (
  imageData,
  folder = "uploads",
  transformation = {}
) => {
  try {
    const options = {
      folder: `skillswap/${folder}`,
      resource_type: "image",
      quality: "auto:good",
      fetch_format: "auto",
      ...transformation,
    };

    if (imageData.startsWith("data:")) {
      // Handle base64 data
      const result = await cloudinary.uploader.upload(imageData, options);
      return result.secure_url;
    } else if (imageData.startsWith("http")) {
      // Handle URL
      const result = await cloudinary.uploader.upload(imageData, options);
      return result.secure_url;
    } else {
      throw new Error("Invalid image data format");
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image");
  }
};

const uploadVideo = async (
  videoData,
  folder = "videos",
  transformation = {}
) => {
  try {
    const options = {
      folder: `skillswap/${folder}`,
      resource_type: "video",
      quality: "auto:good",
      ...transformation,
    };

    if (videoData.startsWith("data:")) {
      const result = await cloudinary.uploader.upload(videoData, options);
      return result.secure_url;
    } else if (videoData.startsWith("http")) {
      const result = await cloudinary.uploader.upload(videoData, options);
      return result.secure_url;
    } else {
      throw new Error("Invalid video data format");
    }
  } catch (error) {
    console.error("Cloudinary video upload error:", error);
    throw new Error("Failed to upload video");
  }
};

const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete image");
  }
};

const generateImageUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, {
    quality: "auto:good",
    fetch_format: "auto",
    ...transformations,
  });
};

const generateVideoUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, {
    resource_type: "video",
    quality: "auto:good",
    ...transformations,
  });
};

module.exports = {
  uploadImage,
  uploadVideo,
  deleteImage,
  generateImageUrl,
  generateVideoUrl,
};
