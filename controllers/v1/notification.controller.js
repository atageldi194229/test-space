"use strict";

const {
  User,
  Notification,
  sequelize,
  Payment,
  GroupUser,
  Group,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const obj = {};

obj.sendInvitation = async (req, res) => {
  // get from client
  let { userIds, groupIds } = req.body;

  // validate data
  userIds = userIds || [];
  groupIds = groupIds || [];
  if (!Array.isArray(userIds) || !Array.isArray(groupIds))
    return next(new ErrorResponse("Validation error"));

  // request db
  let groupUsers = await GroupUser.findAll({
    where: { groupId: groupIds },
    attributes: [`userId`],
  });

  // validate data and add to other users
  userIds = [...userIds, ...groupUsers.map((e) => e.userId)];

  // remove repeating values
  let mp = {};
  for (let i = 0; i < userIds.length; i++) {
    if (!mp[userIds[i]]) mp[userIds[i]] = 1;
    else mp[userIds[i]]++;
  }
  userIds = Object.keys(mp);

  // calculation starts
  let userCount = userIds.length,
    canSend = false,
    dublicatedUsers = userIds.filter((e) => mp[e] > 1).map((e) => Number(e)),
    tsc = {};

  // calculation request db
  let days30 = 30 * 24 * 60 * 60 * 1000;
  let payments = await Payment.findAll({
    where: {
      allowedAt: {
        [Op.gte]: new Date(new Date() - days30),
      },
      status: 1,
    },
    // order: [["createdAt", "asc"]],
  });

  for (let i = 0; i < payments.length; i++) {
    if (payments[i].isTscUnlimited === true) canSend = true;
    else userCount -= payments[i].tsc - payments[i].tscUsed;
  }
  if (canSend) tsc.rest = "unlimited";

  tsc.need = userIds.length; // gerekli bolan tsc
  tsc.lack = canSend || userCount < 0 ? 0 : userCount; // yene shuncha tsc gerek
  tsc.rest = tsc.rest || (-userCount < 0 ? 0 : -userCount); // shuncha galar

  if (userCount <= 0) canSend = true;
  // calculation ends

  // res to the client with token
  res.status(200).json({
    success: true,
  });
};

// temporary function
obj.getAll = async (req, res) => {
  // get data from db
  // let notifications = await Notification.findAll();

  res.status(200).json({
    success: true,
  });
};

// When exporting all collected data
let keys = Object.keys(obj);
// exclude some functions
let excluded_keys = ["status"];
for (let i = 0; i < keys.length; i++)
  if (!excluded_keys.includes(keys[i]))
    obj[keys[i]] = asyncHandler(obj[keys[i]]);
// exporting all functions
module.exports = obj;
