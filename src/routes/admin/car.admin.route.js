const express = require('express');
const {
    getAdminCarByIdController,
    getAllAdminCarsController,
    createAdminCarController,
    updateAdminCarController,
    deleteAdminCarController
} = require("../../controllers/admin/carController")
const uploadCloud = require("../../middleware/uploadCloud");

const router = express.Router();

router.get("/", getAllAdminCarsController);
router.get("/:id", getAdminCarByIdController);
router.post("/", uploadCloud.single("image"), createAdminCarController);
router.put("/:id", uploadCloud.single("image"), updateAdminCarController);
router.delete("/:id", deleteAdminCarController)

module.exports = router;
