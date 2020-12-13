const {
  groupsmigration,
} = require("googleapis/build/src/apis/groupsmigration");
const { Group, GroupUser, User } = require("../models");

(async () => {
  let group = await Group.create({
    name: "group",
    description: "group",
    userId: 1,
  });

  await GroupUser.create({
    groupId: group.id,
    userId: 1,
  });

  // destroy group and see if GroupUser Row is destroyed
  await Group.destroy({ where: { id: group.id } });

  // experiment is successfull, created GroupUser row was deleted

  // exit process
  process.exit();
})();
