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
const ErrorResponse = require("../../utils/errorResponse");
const obj = {};

obj.sendInvitation = async (req, res, next) => {
  // get from client
  let { userIds, groupIds } = req.body;

  // validate data
  userIds = userIds || [];
  groupIds = groupIds || [];
  if (!Array.isArray(userIds) || !Array.isArray(groupIds))
    return next(new ErrorResponse("Validation error"));

  // check if client can send invitaition
  let data = await Payment.canSendInvitation(req.user.id, {
    userIds,
    groupIds,
  });

  // error test
  if (!data.canSend)
    return next(new ErrorResponse("Could not send invitation"));

  // request db (set used to payment tsc)
  let isTscUsed = await Payment.useTsc(req.user.id, {
    tscCount: data.tsc.need,
    payments: data.payments,
  });

  // error test
  if (!isTscUsed)
    return next(new ErrorResponse("Error when using tsc from payment"));

  // send invitation
  // via notification
  // via mail

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
