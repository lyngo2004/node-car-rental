// src/services/userService.js
const User = require("../models/UserAccount");
const Customer = require("../models/Customer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { sequelize } = require("../config/Sequelize");
const saltRounds = 10;

// CREATE USER SERVICE
const createUserService = async (username, email, password) => {
  const t = await sequelize.transaction();

  try {
    // 1. Check username duplicated
    const existingUser = await User.findOne({
      where: { Username: username },
      transaction: t,
    });

    if (existingUser) {
      await t.rollback();
      return { EC: 1, EM: "Username already exists", DT: "" };
    }

    // 2. Hash password
    const hashPassword = await bcrypt.hash(password, saltRounds);

    // 3. Generate new UserId: UA###
    const prefixUser = "UA";
    const latestUser = await User.findOne({
      where: { UserId: { [Op.like]: `${prefixUser}%` } },
      order: [["UserId", "DESC"]],
      transaction: t,
      lock: true,
    });

    const nextUserNumber = latestUser
      ? parseInt(latestUser.UserId.replace(prefixUser, ""), 10) + 1
      : 1;

    const nextUserId = `${prefixUser}${String(nextUserNumber).padStart(3, "0")}`;

    // 4. Create USER ACCOUNT
    const newUser = await User.create(
      {
        UserId: nextUserId,
        Username: username,
        Email: email,
        HashPassword: hashPassword,
        Role: "Customer",
        IsActive: 1,
      },
      { transaction: t }
    );

    // 5. Generate new CustomerId: C###

    const prefixCus = "C";
    const latestCus = await Customer.findOne({
      where: { CustomerId: { [Op.like]: `${prefixCus}%` } },
      order: [["CustomerId", "DESC"]],
      transaction: t,
      lock: true,
    });

    const nextCusNumber = latestCus
      ? parseInt(latestCus.CustomerId.replace(prefixCus, ""), 10) + 1
      : 1;

    const nextCustomerId = `${prefixCus}${String(nextCusNumber).padStart(
      3,
      "0"
    )}`;

    // 6. Create CUSTOMER record
    await Customer.create(
      {
        CustomerId: nextCustomerId,
        UserId: nextUserId,
        Email: email,
      },
      { transaction: t }
    );

    // COMMIT all
    await t.commit();

    return {
      EC: 0,
      EM: "User created successfully",
      DT: newUser,
    };
  } catch (error) {
    await t.rollback();
    console.error("Error in createUserService:", error);
    return { EC: -1, EM: "Server error", DT: null };
  }
};

// LOGIN SERVICE
const loginService = async (username, password) => {
  try {
    // 1. Find user by username
    const user = await User.findOne({ where: { Username: username } });

    if (!user) {
      return { EC: 1, EM: "Username/password not found", DT: "" };
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.HashPassword);
    if (!isMatch) {
      return { EC: 2, EM: "Username/password not found", DT: "" };
    }

    // 3. Create JWT token
    const payload = {
      userId: user.UserId,
      username: user.Username,
      role: user.Role,
    };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return {
      EC: 0,
      EM: "Login successful",
      DT: {
        accessToken,
        user: {
          username: user.Username,
          email: user.Email,
        },
      },
    };
  } catch (error) {
    console.error("Error in loginService:", error);
    return { EC: -1, EM: "Server error", DT: "" };
  }
};

module.exports = {
  createUserService,
  loginService,
};