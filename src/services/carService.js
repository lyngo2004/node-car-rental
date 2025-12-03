const { Op, fn, col } = require("sequelize");
const { sequelize } = require("../config/Sequelize");
const Car = require("../models/Car");
const Rental = require("../models/Rental");
const { combineDateTime, isOverlapWithBuffer } = require("../utils/datetimeUtils");
const { ACTIVE_RENTAL_STATUSES } = require("../constants/rentalStatus");

// ------------------------ Helpers ------------------------
const parseMultiParam = (val) => {
    if (!val && val !== 0) return [];
    if (Array.isArray(val)) return val.map(v => String(v).trim()).filter(Boolean);
    return String(val).split(',').map(v => v.trim()).filter(Boolean);
};

const parseCapacityParam = (val) => parseMultiParam(val).map(v => (Number.isNaN(Number(v)) ? v : Number(v)));

const buildPriceWhere = (min, max) => {
    // By default, if `min` is not provided but `max` is provided, `min` defaults to 0.
    const hasMin = min !== undefined && min !== null && String(min).trim() !== '';
    const hasMax = max !== undefined && max !== null && String(max).trim() !== '';
    let parsedMin = hasMin ? Number(min) : null;
    let parsedMax = hasMax ? Number(max) : null;
    if (!hasMin && hasMax) parsedMin = 0; // default
    if (parsedMin !== null && Number.isNaN(parsedMin)) return { error: { EC: 4, EM: 'Invalid min price' } };
    if (parsedMax !== null && Number.isNaN(parsedMax)) return { error: { EC: 5, EM: 'Invalid max price' } };
    if (parsedMin === null && parsedMax === null) return { where: null };
    if (parsedMin !== null && parsedMax !== null) {
        if (parsedMax < parsedMin) return { error: { EC: 6, EM: 'Invalid price range: max < min' } };
        return { where: { [Op.between]: [parsedMin, parsedMax] } };
    }
    if (parsedMin !== null) return { where: { [Op.gte]: parsedMin } };
    if (parsedMax !== null) return { where: { [Op.lte]: parsedMax } };
    return { where: null };
};

const queryCars = async (where = {}, needAvailability = false) => {
    const include = [];
    if (needAvailability) {
        include.push({
            model: Rental,
            required: false,
            where: { RentalStatus: { [Op.in]: ACTIVE_RENTAL_STATUSES } }
        });
    }
    return await Car.findAll({ where, include });
};

const filterAvailableCarsFromList = (cars, start, end) => cars.filter((car) => {
    for (const rental of car.Rentals || []) {
        const existingStart = combineDateTime(rental.PickUpDate, rental.PickUpTime);
        const existingEnd = combineDateTime(rental.DropOffDate, rental.DropOffTime);
        if (!existingStart || !existingEnd) continue;
        if (isOverlapWithBuffer(start, end, existingStart, existingEnd, 2)) return false;
    }
    return true;
});

// GET ALL CARS
const fetchAllCars = async () => {
    try {
        const result = await Car.findAll();

        return {
            EC: 0,
            EM: "Success",
            DT: result
        };

    } catch (error) {
        console.log(">>> fetchAllCars error:", error);
        return {
            EC: -1,
            EM: "Internal server error",
            DT: null
        };
    }
};

// CHECK AVAILABILITY BY PICK-DROP
const fetchAvailableCarsByPickDrop = async (params) => {
    try {
        const {
            pickupLocation,
            pickupDate,
            pickupTime,
            dropoffLocation,
            dropoffDate,
            dropoffTime
        } = params;

        const now = new Date();

        // ----- Convert to datetime -----
        const newStart = new Date(`${pickupDate}T${pickupTime}:00`);
        const newEnd = new Date(`${dropoffDate}T${dropoffTime}:00`);

        if (newStart < now) {
            return {
                EC: 1,
                EM: "Pick-up time cannot be in the past.",
                DT: null,
            };
        }

        if (newEnd < now) {
            return {
                EC: 2,
                EM: "Drop-off time cannot be in the past.",
                DT: null,
            };
        }
        // ----- Validate time logic -----
        if (newEnd <= newStart) {
            return {
                EC: 3,
                EM: "Drop-off time must be after pick-up time.",
                DT: null
            };
        }

        const cars = await queryCars({}, true);
        const availableCars = filterAvailableCarsFromList(cars, newStart, newEnd);

        return {
            EC: 0,
            EM: "Success",
            DT: availableCars
        };

    } catch (error) {
        console.log(">>> fetchAvailableCarsByPickDrop error:", error);
        return {
            EC: -1,
            EM: "Internal server error",
            DT: null
        };
    }
};

const fetchFilterOptions = async () => {
    try {
        const types = await Car.findAll({
            attributes: [
                "CarType",
                [fn("COUNT", col("CarType")), "count"]
            ],
            group: ["CarType"],
            order: []
        });

        const capacities = await Car.findAll({
            attributes: [
                "Capacity",
                [fn("COUNT", col("Capacity")), "count"]
            ],
            group: ["Capacity"],
            order: []
        });

        // `sequelize.query` returns an array where the first item is the rows array
        const [priceRows] = await sequelize.query(`
            SELECT 
                MIN(PricePerDay) AS minPrice,
                MAX(PricePerDay) AS maxPrice
            FROM Car;
        `);

        // Normalize price output to an object with minPrice and maxPrice
        const priceRow = Array.isArray(priceRows) && priceRows.length > 0 ? priceRows[0] : { minPrice: null, maxPrice: null };
        const maxPrice = Number(priceRow.maxPrice) || 0;
        const priceObj = { minPrice: 0, maxPrice };

        return {
            EC: 0,
            EM: "Success",
            DT: {
                types,
                capacities,
                price: priceObj
            }
        };

    } catch (error) {
        console.log(">>> fetchFilterOptions error:", error);
        return {
            EC: -1,
            EM: "Internal server error",
            DT: null
        };
    }
};

// FETCH CARS WITH MULTIPLE FILTERS (type(s), capacity(s), price range, optional availability)
// - Supports `type` query as array or comma-separated string
// - Supports `capacity` query as single value, array, or comma-separated string
// - `min` and `max` for price range can be provided together or separately
// - Optional availability check: provide pickupDate, pickupTime, dropoffDate, dropoffTime
const fetchCarsByFilters = async (params) => {
    try {
        const {
            type,
            capacity,
            min,
            max,
            pickupDate,
            pickupTime,
            dropoffDate,
            dropoffTime
        } = params;

        // Build where clause for Car
        const where = {};
        // Types: support array or comma-separated string
        const typesArr = parseMultiParam(type);
        if (typesArr.length > 0) where.CarType = { [Op.in]: typesArr };
        // Capacities: support array or comma-separated string
        const capConverted = parseCapacityParam(capacity);
        if (capConverted.length > 0) where.Capacity = { [Op.in]: capConverted };

        // Price range - validate numeric inputs/construct where clause
        const priceCheck = buildPriceWhere(min, max);
        if (priceCheck.error) return { EC: priceCheck.error.EC, EM: priceCheck.error.EM, DT: null };
        if (priceCheck.where) where.PricePerDay = priceCheck.where;

        // Decide whether we need to include rentals for availability check
        const needAvailability = pickupDate && pickupTime && dropoffDate && dropoffTime;
        let newStart, newEnd;
        if (needAvailability) {
            const now = new Date();
            newStart = new Date(`${pickupDate}T${pickupTime}:00`);
            newEnd = new Date(`${dropoffDate}T${dropoffTime}:00`);

            if (newStart < now) {
                return { EC: 7, EM: 'Pick-up time cannot be in the past', DT: null };
            }
            if (newEnd < now) {
                return { EC: 8, EM: 'Drop-off time cannot be in the past', DT: null };
            }
            if (newEnd <= newStart) {
                return { EC: 9, EM: 'Drop-off time must be after pick-up time', DT: null };
            }
        }

        const cars = await queryCars(where, needAvailability);

        // Filter by availability only if we asked for it
        let resultCars = cars;
        if (needAvailability) {
            resultCars = filterAvailableCarsFromList(cars, newStart, newEnd);
        }

        return {
            EC: 0,
            EM: "Success",
            DT: resultCars
        };

    } catch (error) {
        console.log('>>> fetchCarsByFilters error:', error);
        return { EC: -1, EM: 'Internal server error', DT: null };
    }
};

const fetchCarById = async (carId) => {
    try {
        const car = await Car.findByPk(carId);

        if (!car) {
            return {
                EC: 1,
                EM: "Car not found",
                DT: null
            };
        }
        return {
            EC: 0,
            EM: "Success",
            DT: car
        };
    } catch (error) {
        console.log(">>> fetchCarById error:", error);
        return {
            EC: -1, 
            EM: "Internal server error",
            DT: null
        };
    }
};


module.exports = {
    fetchAllCars,
    fetchAvailableCarsByPickDrop,
    fetchFilterOptions,
    fetchCarsByFilters,
    fetchCarById
};
