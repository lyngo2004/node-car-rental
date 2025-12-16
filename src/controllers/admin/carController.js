const {
    fetchAllAdminCarsService,
    fetchAdminCarByIdService,
    createAdminCarService,
    updateAdminCarService,
    deleteAdminCarService
} = require("../../services/carService")

const getAllAdminCarsController = async (req, res) => {
    const data = await fetchAllAdminCarsService();
    return res.status(200).json(data);
}

const getAdminCarByIdController = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      EC: 1,
      EM: "Missing car id",
      DT: null,
    });
  }

  const data = await fetchAdminCarByIdService(id);
  return res.status(200).json(data);
};

const createAdminCarController = async (req, res) => {
  try {
    const payload = req.body;
    const file = req.file; // multer: upload.single("image")

    const data = await createAdminCarService(payload, file);

    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> createAdminCarController error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Internal server error",
      DT: null,
    });
  }
};

const updateAdminCarController = async (req, res) => {
  try {
    const carId = req.params.id;
    const payload = req.body;
    const file = req.file; // có thể undefined

    if (!carId) {
      return res.status(400).json({
        EC: 1,
        EM: "Missing car id",
        DT: null,
      });
    }

    const data = await updateAdminCarService(carId, payload, file);
    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> updateAdminCarController error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Internal server error",
      DT: null,
    });
  }
};

const deleteAdminCarController = async (req, res) => {
  try {
    const carId = req.params.id;

    if (!carId) {
      return res.status(400).json({
        EC: 1,
        EM: "Missing car id",
        DT: null,
      });
    }

    const data = await deleteAdminCarService(carId);

    return res.status(200).json(data);
  } catch (error) {
    console.error(">>> deleteAdminCarController error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Internal server error",
      DT: null,
    });
  }
};

module.exports = {
  getAllAdminCarsController,
  getAdminCarByIdController,
  createAdminCarController,
  updateAdminCarController,
  deleteAdminCarController
};