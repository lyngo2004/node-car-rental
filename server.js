require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/db'); // ✅ đường dẫn chính xác
const apiRoutes = require('./src/routes/api');

const app = express();
app.use(cors());

//config req.body
app.use(express.json()); // cho JSON
app.use(express.urlencoded({ extended: true })); // cho form data

//config template engine
// configViewEngine(app);

// Kết nối database
connectDB();

// Route test
app.use('/api/v1', apiRoutes);

app.get('/', (req, res) => {
  res.send('✅ Server and SQL Server are connected!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
