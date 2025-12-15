const { checkoutRentalService } = require("../../services/rentalService");

const checkoutRentalController = async (req, res) => {
  const userId = req.user?.userId; // từ JWT middleware
  const payload = req.body;        // FE gửi lên

  const data = await checkoutRentalService(userId, payload);
  return res.status(200).json(data);
};

module.exports = {
  checkoutRentalController,
};
