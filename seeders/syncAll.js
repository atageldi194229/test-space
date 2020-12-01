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
  // await User.sync({});
  // await Test.sync({});
  // await Price.sync({});
  // await Payment.sync({});
  // await Question.sync({});
  // await Notification.sync({});
  await sequelize.sync({ force: true });

  await User.create({});

  console.log("The end.");
})();
