const { sequelize } = require("../models");
const triggers = require("./triggers");
const views = require("./views");

(async () => {
  // -> DROP
  // triggers if exists
  // for (let trigger of triggers) {
  //   await sequelize.query(`DROP TRIGGER IF EXISTS \`${trigger.name}\`;`);
  // }
  // views if exists
  for (let view of views) {
    await sequelize.query(`DROP VIEW IF EXISTS \`${view.name}\`;`);
  }

  // -> CREATE
  // triggers
  // for (let trigger of triggers) {
  //   await sequelize
  //     .query(trigger.query)
  //     .catch(console.log.bind(null, trigger.name));
  // }

  // views
  for (let view of views) {
    await sequelize.query(view.query).catch(console.log.bind(null, view.name));
  }

  // exit
  process.exit();
})();
