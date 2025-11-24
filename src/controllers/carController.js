const { getCarService } = require("../services/carService");

const getAllCar = async (req, res) => {
  const data = await getCarService();
  return res.status(200).json(data);
};

module.exports = {
  getAllCar,
};