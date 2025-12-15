// services/customerService.js
const Customer = require("../models/Customer");
const User = require("../models/UserAccount");

/**
 * Lấy thông tin customer hiện tại từ userId
 * Trả về theo format EC/EM/DT giống carService
 */
const getCurrentCustomerService = async (userId) => {
  try {
    const customer = await Customer.findOne({
      where: { UserId: userId },
      include: [{ model: User, attributes: ["Email"] }],
    });

    if (!customer) {
      return {
        EC: 1,
        EM: "Customer not found",
        DT: null,
      };
    }

    return {
      EC: 0,
      EM: "OK",
      DT: {
        CustomerId: customer.CustomerId,
        FullName: customer.FullName || "",
        Email: customer.Email || "",
        Phone: customer.Phone || "",
        Address: customer.Address || "",
        DriverLicense: customer.DriverLicense || "",
      },
    };
  } catch (err) {
    console.error("getCurrentCustomerService error:", err);
    return {
      EC: -1,
      EM: "Server error",
      DT: null,
    };
  }
};

module.exports = {
  getCurrentCustomerService,
};
