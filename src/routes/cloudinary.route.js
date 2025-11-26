const express = require("express");
const { getAllCarImages } = require("../services/cloudinaryService");

const router = express.Router();

router.get("/car-images", async (req, res) => {
  const images = await getAllCarImages();

  if (!images) {
    return res.status(500).json({
      EC: -1,
      EM: "Cannot fetch images from Cloudinary",
      DT: []
    });
  }

  return res.status(200).json({
    EC: 0,
    EM: "Fetched all car images",
    DT: images
  });
});

module.exports = router;
