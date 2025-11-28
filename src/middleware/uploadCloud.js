const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "cars",               // folder trong Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const uploadCloud = multer({ storage });

module.exports = uploadCloud;
