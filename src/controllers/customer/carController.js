const {
  fetchAllCars,
  fetchAvailableCarsByPickDrop,
  fetchFilterOptions,
  fetchCarsByFilters,
  fetchCarById
} = require("../../services/carService");

const getAllCarsController = async (req, res) => {
  const data = await fetchAllCars();

  return res.status(200).json(data);
};

const getAvailableCarsController = async (req, res) => {
  const data = await fetchAvailableCarsByPickDrop(req.query);
  return res.status(200).json(data);
};

const getFilterOptionsController = async (req, res) => {
  const data = await fetchFilterOptions();
  return res.status(200).json(data);
};

const filterCarsByFiltersController = async (req, res) => {
  const data = await fetchCarsByFilters(req.query);
  return res.status(200).json(data);
};

const getCarByIdController = async (req, res) => {
  const carId = req.params.id;
  const data = await fetchCarById(carId);
  return res.status(200).json(data);
};

module.exports = {
  getAllCarsController,
  getAvailableCarsController,
  getFilterOptionsController,
  filterCarsByFiltersController,
  getCarByIdController
};