const { sequelize } = require("../models");
const triggers = require("./triggers");

(async () => {
  // 1st drop triggers if exists
  for (let i = 0; i < triggers.length; i++) {
    await sequelize.query(`DROP TRIGGER IF EXISTS \`${triggers[i].name}\`;`);
  }
  // 2nd create triggers
  for (let i = 0; i < triggers.length; i++) {
    await sequelize
      .query(triggers[i].query)
      .catch(console.log.bind(null, triggers[i].name));
  }
  process.exit();
})();
