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

module.exports = { getAllCarImages };
