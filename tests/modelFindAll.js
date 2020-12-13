const { Group } = require("../models");

(async () => {
  let groups = await Group.findAll({
    where: { userId: 1 },
    attributes: ["name", "description"],
  });
  console.log(groups);
  process.exit();
})();
