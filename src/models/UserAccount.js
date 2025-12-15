const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/Sequelize');

const UserAccount = sequelize.define('UserAccount', {
    UserId: {
        type: DataTypes.STRING(450),
        primaryKey: true,
        allowNull: false,
    },
    Username: { type: DataTypes.STRING(450), allowNull: false, unique: true },
    HashPassword: { type: DataTypes.STRING(255), allowNull: false },
    Role: { type: DataTypes.STRING(50), allowNull: true },
    Email: { type: DataTypes.STRING(100), allowNull: true },
    IsActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
    tableName: 'UserAccount',
    timestamps: false,
    hasTrigger: true,
});

module.exports = UserAccount;
