const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log("🔍 [Sequelize ENV CHECK]");
console.log({
  SEQ_DATABASE: process.env.SEQ_DATABASE,
  SEQ_USER: process.env.SEQ_USER,
  SEQ_PASSWORD: process.env.SEQ_PASSWORD ? "(hidden)" : undefined,
  SEQ_SERVER: process.env.SEQ_SERVER,
  SEQ_PORT: process.env.SEQ_PORT,
});

const sequelize = new Sequelize(
  process.env.SEQ_DATABASE,   
  process.env.SEQ_USER,       
  process.env.SEQ_PASSWORD,   
  {
    host: process.env.SEQ_SERVER || 'localhost',
    port: parseInt(process.env.SEQ_PORT || '1433', 10),
    dialect: 'mssql',
    logging: false,
    dialectOptions: {
      encrypt: false,               
      trustServerCertificate: true, 
    },
  }
);

async function connectSequelize() {
  try {
    console.log(">>> Connecting to SQL Server...");
    await sequelize.authenticate();
    console.log(">>> Connected to Sequelize Database!");
  } catch (err) {
    console.error(" Sequelize connection failed!");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error code:", err.parent?.code || "(no code)");
  }
}

module.exports = { sequelize, connectSequelize };
