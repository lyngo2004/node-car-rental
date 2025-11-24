const Car = require("../models/Car");

const getCarService = async () => {
    try {
        let result = await Car.findAll();
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
};

module.exports = {
    getCarService,
};