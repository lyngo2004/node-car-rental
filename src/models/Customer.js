const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { v4: uuidv4 } = require('uuid');
const UserAccount = require('./UserAccount');

const Customer = sequelize.define('Customer', {
    CustomerId: {
        type: DataTypes.STRING(450),
        primaryKey: true,
        defaultValue: () => uuidv4(), // tự động tạo ID
    },
    UserId: {
        type: DataTypes.STRING(450),
        allowNull: false,
    },
    FullName: DataTypes.STRING,
    Email: DataTypes.STRING,
    Phone: DataTypes.STRING,
    Address: DataTypes.STRING,
    DriverLicense: DataTypes.STRING,
    DateOfBirth: DataTypes.DATE,
}, {
    tableName: 'Customers',
    timestamps: false,
});

// Quan hệ 1-1
Customer.belongsTo(UserAccount, { foreignKey: 'UserId' });
UserAccount.hasOne(Customer, { foreignKey: 'UserId' });

module.exports = Customer;
