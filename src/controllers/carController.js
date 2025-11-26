const {
  fetchAllCars,
  fetchAvailableCarsByPickDrop,
  fetchFilterOptions,
  fetchCarsByType,
  fetchCarsByCapacity,
  fetchCarsByPrice,
  fetchCarsByFilters
} = require("../services/carService");

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

const filterCarsByTypeController = async (req, res) => {
  const { type } = req.query;
  const data = await fetchCarsByType(type);
  return res.status(200).json(data);
};

const filterCarsByCapacityController = async (req, res) => {
  const { capacity } = req.query;
  const data = await fetchCarsByCapacity(capacity);
  return res.status(200).json(data);
};

const filterCarsByPriceController = async (req, res) => {
  const { min, max } = req.query;
  const data = await fetchCarsByPrice(min, max);
  return res.status(200).json(data);
};

// Controller: filter cars by multiple criteria (type(s), capacity(s), price range, optional availability)
// Example query:
// /api/cars/filter?type=Sedan,SUV&capacity=5&min=100&max=300
// or
// /api/cars/filter?type[]=Sedan&type[]=SUV&capacity=4,5&min=100&max=300&pickupDate=2025-11-27&pickupTime=10:00&dropoffDate=2025-11-29&dropoffTime=16:00
const filterCarsByFiltersController = async (req, res) => {
  const data = await fetchCarsByFilters(req.query);
  return res.status(200).json(data);
};

module.exports = {
  getAllCarsController,
  getAvailableCarsController,
  getFilterOptionsController,
  filterCarsByTypeController,
  filterCarsByCapacityController,
  filterCarsByPriceController, 
  filterCarsByFiltersController
};