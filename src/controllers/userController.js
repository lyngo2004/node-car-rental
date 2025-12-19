//src\controllers\userController.js
const { createUserService, loginService,
 } = require("../services/userService");

const createUser = async (req, res) => {
    const { username, email, password } = req.body;
    const data = await createUserService(username, email, password);
    return res.status(200).json(data);
};

const handleLogin = async (req, res) => {
  const { username, password } = req.body;
  const data = await loginService(username, password);
  return res.status(200).json(data);
};



module.exports = {
  createUser, handleLogin
};
