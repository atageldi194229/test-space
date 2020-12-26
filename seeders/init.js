const { sequelize } = require("../models");
const triggers = require("./triggers");

(async () => {
  for (let i = 0; i < triggers.length; i++) {
    await sequelize
      .query(triggers[i].query)
      .catch(console.log.bind(null, triggers[i].name));
  }
  process.exit();
})();
