const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Rental = require('./Rental');

const Payment = sequelize.define('Payment', {
    PaymentId: { 
        type: DataTypes.STRING(450), 
        primaryKey: true,
        defaultValue: () => uuidv4(),
    },
    RentalId: { type: DataTypes.STRING(450), allowNull: false },
    PaymentDate: { type: DataTypes.DATE, allowNull: true },
    PaymentAmount: { type: DataTypes.DECIMAL(18, 2), allowNull: true },
    PaymentMethod: { type: DataTypes.STRING, allowNull: true },
    IsPaid: { type: DataTypes.BOOLEAN, allowNull: true }
}, {
    tableName: 'Payments',
    timestamps: false
});

Payment.belongsTo(Rental, { foreignKey: 'RentalId' });
Rental.hasMany(Payment, { foreignKey: 'RentalId' });

module.exports = Payment;
