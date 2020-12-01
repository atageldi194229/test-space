const { sequelize } = require("../models");

(async () => {
  await sequelize.drop({ force: true });

  console.log("The end.");
})();
