const Customer = require("../models/Customer");
const User = require("../models/UserAccount");

const getCurrentCustomer = async (req, res) => {
  try {
    const userId = req.user.userId; // lấy từ middleware sửa ở bước 2

    const customer = await Customer.findOne({
      where: { UserId: userId },
      include: [{ model: User, attributes: ["Email"] }],
    });

    if (!customer) {
      return res.status(404).json({
        EC: 1,
        EM: "Customer not found",
        DT: null,
      });
    }

    return res.status(200).json({
      EC: 0,
      EM: "OK",
      DT: {
        CustomerId: customer.CustomerId,
        FullName: customer.FullName || "",
        Email: customer.Email || customer.UserAccount?.Email || "",
        Phone: customer.Phone || "",
        Address: customer.Address || "",
        DriverLicense: customer.DriverLicense || "",
        DateOfBirth: customer.DateOfBirth || "",
      },
    });
  } catch (err) {
    console.error("Get current customer error:", err);
    return res.status(500).json({
      EC: -1,
      EM: "Server error",
      DT: null,
    });
  }
};

module.exports = { getCurrentCustomer };
