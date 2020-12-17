const { Payment } = require("../models");

(async () => {
  const month = 30 * 24 * 60 * 60 * 1000;
  await Payment.create({
    userId: 1,
    isTscUnlimited: true,
    status: 1,
    allowedAt: new Date(new Date() - month),
  });

  console.log("The end.");
  process.exit();
})();
