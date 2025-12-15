require("dotenv").config(); // 👈 BẮT BUỘC

const { sequelize } = require("../src/config/Sequelize");
const { createAdminWithEmployeeService } = require("../src/services/userService");

(async () => {
  try {
    await sequelize.authenticate();
    console.log(">>> DB connected");

    const result = await createAdminWithEmployeeService({
      username: "admin",
      email: "admin@carrental.com",
      password: "admin123",
      fullName: "Alexender",
      phone: "0123456789",
      position: "Administrator",
    });

    console.log(result);
    process.exit(0);
  } catch (err) {
    console.error(">>> Seed admin failed:", err);
    process.exit(1);
  }
})();
