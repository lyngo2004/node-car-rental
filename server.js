//server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectSequelize } = require('./src/config/Sequelize');
const path = require('path');
const apiRoutes = require(path.join(__dirname, 'src', 'routes', 'api'));
const commonRoute = require("./src/routes/common.route");
const { swaggerUi, swaggerSpec } = require("./src/config/swagger");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount APIs
app.use("/api/v1", apiRoutes);

app.get('/', (req, res) => {
  res.send('>>> Server and SQL Server are connected!');
});

app.use("/api/v1/common", commonRoute);

// Kết nối database
connectSequelize();

// App listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
