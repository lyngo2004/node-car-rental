const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/Sequelize');
const UserAccount = require('./UserAccount');

const Customer = sequelize.define('Customer', {
    CustomerId: {
        type: DataTypes.STRING(450),
        primaryKey: true,
        allowNull: false,
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
    tableName: 'Customer',
    timestamps: false,
});

// Quan hệ 1-1
Customer.belongsTo(UserAccount, { foreignKey: 'UserId' });
UserAccount.hasOne(Customer, { foreignKey: 'UserId' });

module.exports = Customer;
