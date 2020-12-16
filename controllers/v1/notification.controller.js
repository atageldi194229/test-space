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
