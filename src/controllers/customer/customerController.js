// controllers/customerController.js
const { 
  getCurrentCustomerService,
  getCustomerNotifications
 } = require("../../services/customerService");

const getCurrentCustomerController = async (req, res) => {
  const userId = req.user.userId;
  const data = await getCurrentCustomerService(userId);
  return res.status(200).json(data);
};

module.exports = {
  getCurrentCustomerController,
};
