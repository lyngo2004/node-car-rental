const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/Sequelize');
const Customer = require('./Customer');
const Car = require('./Car');
// const Employee = require('./Employee');

const Rental = sequelize.define('Rental', {
    RentalId: { 
        type: DataTypes.STRING(450), 
        primaryKey: true,
        allowNull: false,
    },
    CustomerId: { type: DataTypes.STRING(450), allowNull: false },
    CarId: { type: DataTypes.STRING(450), allowNull: false },
    PickUpLocation: { type: DataTypes.STRING, allowNull: true },
    PickUpDate: { type: DataTypes.DATE, allowNull: true },
    PickUpTime: { type: DataTypes.TIME, allowNull: true },
    DropOffLocation: { type: DataTypes.STRING, allowNull: true },
    DropOffDate: { type: DataTypes.DATE, allowNull: true },
    DropOffTime: { type: DataTypes.TIME, allowNull: true },
    RentalStatus: { type: DataTypes.STRING, allowNull: true },
    TotalAmount: { type: DataTypes.DECIMAL(18, 2), allowNull: true },
    ProcessedBy: { type: DataTypes.STRING(450), allowNull: true },
    IssuedDate: { type: DataTypes.DATE, allowNull: false },
}, {
    tableName: 'Rental',
    timestamps: false
});

//  Relationships
Rental.belongsTo(Customer, { foreignKey: 'CustomerId' });
Customer.hasMany(Rental, { foreignKey: 'CustomerId' });

Rental.belongsTo(Car, { foreignKey: 'CarId' });
Car.hasMany(Rental, { foreignKey: 'CarId' });

// Rental.belongsTo(Employee, { foreignKey: 'ProcessedBy' });
// Employee.hasMany(Rental, { foreignKey: 'ProcessedBy' });

module.exports = Rental;
