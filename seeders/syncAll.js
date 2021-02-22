const {
  User,
  // Test,
  // Payment,
  // Price,
  // Question,
  // Notification,
  sequelize,
} = require("../models");

(async () => {
  await sequelize.sync({ force: true });

  console.log("The end.");
})();
