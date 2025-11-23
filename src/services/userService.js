// src/services/userService.js
const User = require("../models/UserAccount");
const Customer = require("../models/Customer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { sequelize } = require("../config/Sequelize");
const e = require("express");
const saltRounds = 10;

const createUserService = async (username, email, password) => {
  const t = await sequelize.transaction();
  try {
    // Hash password
    const hashPassword = await bcrypt.hash(password, saltRounds);

    // Create new UserId (UA###)
    const prefixUser = "UA";
    const latestUser = await User.findOne({
      where: { UserId: { [Op.like]: `${prefixUser}%` } },
      order: [["UserId", "DESC"]],
      transaction: t,
      lock: true,
    });

    let nextUserNumber = 1;
    if (latestUser) {
      const currentCode = parseInt(latestUser.UserId.replace(prefixUser, ""), 10);
      nextUserNumber = currentCode + 1;
    }

    const nextUserId = `${prefixUser}${String(nextUserNumber).padStart(3, "0")}`;

    // Create new UserAccount
    const newUser = await User.create({
      UserId: nextUserId,
      Username: username,
      Email: email,
      HashPassword: hashPassword,
      Role: "Customer",
      IsActive: 1,
    }, { transaction: t });

    // Create new CustomerId (C###)
    const prefixCus = "C";
    const latestCus = await Customer.findOne({
      where: { CustomerId: { [Op.like]: `${prefixCus}%` } },
      order: [["CustomerId", "DESC"]],
      transaction: t,
      lock: true,
    });

    let nextCusNumber = 1;
    if (latestCus) {
      const currentCode = parseInt(latestCus.CustomerId.replace(prefixCus, ""), 10);
      nextCusNumber = currentCode + 1;
    }

    const nextCustomerId = `${prefixCus}${String(nextCusNumber).padStart(3, "0")}`;

    // Create corresponding customer
    await Customer.create({
      CustomerId: nextCustomerId,
      UserId: nextUserId,
      Email: email,
    }, { transaction: t });

    await t.commit();

    return newUser;
  } catch (error) {
    await t.rollback();
    console.error("Error in createUserService:", error);
    return null;
  }
};

const loginService = async (username, password) => {
  try {
    //fetch user by username
    const user = await User.findOne({ where: { Username: username } });
    if (!user) {
      return {
        EC: 1,
        EM: "Username/password not found",
        DT: "",
      }
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.HashPassword);
    if (!isMatch) {
      return {
        EC: 2,
        EM: "Username/password not found",
        DT: "",
      }
    } else {
      //create session or access token (to be implemented)
      const payload = {
        userId: user.UserId,
        username: user.Username,
        role: user.Role,
      };
      const accessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN });
      return {
        EC: 0,
        EM: "Login successful",
        DT:
        {
          accessToken,
          user: {
            username: user.Username,
            email: user.Email,
          }
        }
      };
    }
  } catch (error) {
    console.log(error);
    return {
      EC: -1,
      EM: "Server error",
      DT: "",
    };
  }
};

module.exports = {
  createUserService, loginService
};