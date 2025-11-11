const { sequelize, connectSequelize } = require("./src/config/Sequelize");

(async () => {
  await connectSequelize();

  const [results] = await sequelize.query("SELECT TOP 5 * FROM UserAccount");
  console.log("📦 Dữ liệu từ UserAccount:");
  console.table(results);

  await sequelize.close();
})();
