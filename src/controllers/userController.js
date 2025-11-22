//src\controllers\userController.js
const { createUserService, loginService } = require("../services/userService");

const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = await createUserService(username, email, password);

    if (!newUser) {
      return res.status(500).json({ success: false, message: "Failed to create user" });
    }

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        username: newUser.Username,
        email: newUser.Email,
        role: newUser.Role,
      },
    });

  } catch (err) {
    console.error("Error in createUser:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const handleLogin = async (req, res) => {
  const { username, password } = req.body;
  const data = await loginService(username, password);
  return res.status(200).json(data);
};

module.exports = {
  createUser, handleLogin
};


// const { getAllUsers } = require('../models/userModel');

// const createUser = (req, res) => {
//   return res.status(200).json("hello create user");
// };

// const getUsers = async (req, res) => {
//   try {
//     const users = await getAllUsers();
//     res.status(200).json({
//       success: true,
//       count: users.length,
//       data: users
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

// module.exports = {
//   createUser,
//   getUsers
// };
