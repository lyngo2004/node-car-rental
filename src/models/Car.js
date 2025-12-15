const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/Sequelize');

const Car = sequelize.define('Car', {
    CarId: {
        type: DataTypes.STRING(450),
        primaryKey: true,
        allowNull: false,
    },
    LicensePlate: { type: DataTypes.STRING, allowNull: false },
    Brand: { type: DataTypes.STRING, allowNull: true },
    Model: { type: DataTypes.STRING, allowNull: true },
    ManufactureYear: { type: DataTypes.INTEGER, allowNull: true },
    CarStatus: { type: DataTypes.STRING, allowNull: true },
    PricePerDay: { type: DataTypes.DECIMAL(18, 2), allowNull: true },
    Mileage: { type: DataTypes.INTEGER, allowNull: true },
    CarType: { type: DataTypes.STRING, allowNull: true },
    Capacity: { type: DataTypes.INTEGER, allowNull: true },
    Color: { type: DataTypes.STRING, allowNull: true },
    Description: { type: DataTypes.STRING, allowNull: true },
    ImagePath: { type: DataTypes.STRING(255), allowNull: true }
}, {
    tableName: 'Car',
    timestamps: false
});

module.exports = Car;
