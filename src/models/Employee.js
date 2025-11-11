const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { v4: uuidv4 } = require('uuid');
const UserAccount = require('./UserAccount');

const Employee = sequelize.define('Employee', {
    EmployeeId: {
        type: DataTypes.STRING(450),
        primaryKey: true,
        defaultValue: () => uuidv4(),
    },
    UserId: {
        type: DataTypes.STRING(450),
        allowNull: false,
    },
    FullName: DataTypes.STRING(100),
    Phone: DataTypes.STRING(20),
    Email: DataTypes.STRING(100),
    Position: DataTypes.STRING(50),
    HireDate: DataTypes.DATEONLY,
}, {
    tableName: 'Employee',
    timestamps: false,
});

Employee.belongsTo(UserAccount, { foreignKey: 'UserId' });
UserAccount.hasOne(Employee, { foreignKey: 'UserId' });

module.exports = Employee;
