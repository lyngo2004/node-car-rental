const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/Sequelize');
const { v4: uuidv4 } = require('uuid');

const UserAccount = sequelize.define('UserAccount', {
    UserId: {
        type: DataTypes.STRING(450),
        primaryKey: true,
        defaultValue: () => uuidv4(), // tự động tạo ID dạng GUID
    },
    Username: { type: DataTypes.STRING(450), allowNull: false, unique: true },
    HashPassword: { type: DataTypes.STRING(255), allowNull: false },
    Role: { type: DataTypes.STRING(50), allowNull: true },
    Email: { type: DataTypes.STRING(100), allowNull: true },
    IsActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
    tableName: 'UserAccount',
    timestamps: false,
});

module.exports = UserAccount;
