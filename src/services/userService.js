const User = require("../models/UserAccount");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const createUserService = async ( username, email, password) => {
    try {
        //hash user password
        const hashPassword = await bcrypt.hash(password, saltRounds);

        //save user to database
        let result = await User.create({
            Username:  username,
            Email: email,
            HashPassword: hashPassword,
            Role: "Customer",
            IsActive: 1
        })
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}

const loginService = async (username, password) => {
  const user = await User.findOne({ where: { Username: username } });
  if (!user) return null;

  // Nếu hash dạng bcrypt
  if (user.HashPassword.startsWith("$2b$")) {
    const match = await bcrypt.compare(password, user.HashPassword);
    return match ? user : null;
  }

  // Nếu password cũ lưu plaintext
  return password === user.HashPassword ? user : null;
};


module.exports = {
  createUserService,
  loginService,
};