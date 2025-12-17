const { 
  checkoutRentalService,
  fetchRentalByIdService
 } = require("../../services/rentalService");

const checkoutRentalController = async (req, res) => {
  const userId = req.user?.userId; // từ JWT middleware
  const payload = req.body;        // FE gửi lên

  const data = await checkoutRentalService(userId, payload);
  return res.status(200).json(data);
};

const getRentalByIdController = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      EC: 1,
      EM: "Missing rental id",
      DT: null,
    });
  }

  const data = await fetchRentalByIdService(id);
  return res.status(200).json(data);
};

module.exports = {
  checkoutRentalController,
  getRentalByIdController
};
