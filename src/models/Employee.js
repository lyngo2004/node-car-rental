const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/Sequelize');
const UserAccount = require('./UserAccount');

const Employee = sequelize.define('Employee', {
    EmployeeId: {
        type: DataTypes.STRING(450),
        primaryKey: true,
        allowNull: false,
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
