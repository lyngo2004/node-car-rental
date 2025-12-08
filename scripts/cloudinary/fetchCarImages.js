require("dotenv").config();

// Import Cloudinary service
const { getAllCarImages } = require("../../src/services/cloudinaryService");

(async () => {
  console.log("=== Fetching images from Cloudinary... ===");

  try {
    const images = await getAllCarImages();

    if (!images) {
      console.error(" Failed to fetch images.");
      process.exit(1);
    }

    console.log(`Retrieved ${images.length} images:\n`);
    console.log(images);

    // await CarImage.bulkCreate(images);

    process.exit(0);
  } catch (error) {
    console.error("Script failed:", error);
    process.exit(1);
  }
})();
