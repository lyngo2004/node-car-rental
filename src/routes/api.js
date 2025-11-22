//src\routes\api.js

// const express = require('express');
// const { createUser } = require('../controllers/userController'); // ✅ import đúng

// const routerAPI = express.Router();

// // Route test GET
// routerAPI.get('/', (req, res) => {
//   return res.status(200).json({ message: 'API is working!' });
// });
// routerAPI.post('/register', createUser);

// module.exports = routerAPI;


const express = require('express');
const { createUser, handleLogin } = require('../controllers/userController');

const routerAPI = express.Router();

routerAPI.get('/', (req, res) => {
    return res.status(200).json({ message: 'API is working!' });
});

// 🧠 Tạo user
routerAPI.post('/register', createUser);
routerAPI.post('/login', handleLogin);

module.exports = routerAPI;
