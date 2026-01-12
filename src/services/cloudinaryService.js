const cloudinary = require("../config/cloudinary");

const getAllCarImages = async () => {
  try {
    const result = await cloudinary.search
      .expression("folder:Cars")      // folder tên cars
      .max_results(50)
      .execute();

    return result.resources.map(img => ({
      public_id: img.public_id,
      url: img.secure_url,
      format: img.format,
      folder: img.folder
    }));

  } catch (error) {
    console.error("Cloudinary search error:", error);
    return null;
  }
};

const uploadCarImage = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "Cars",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

const deleteCarImage = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
};

module.exports = {
  getAllCarImages,
  uploadCarImage,
  deleteCarImage
};
