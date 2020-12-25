"use strict";

const {
  Price,
  Payment,
  sequelize,
  User,
  Group,
  GroupUser,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const { v4: uuidv4 } = require("uuid");
const obj = {};

/**
 * buy tsc and tcc
 * action - /v1/payment/buy
 * method - post
 * token
 */
obj.buyTscAndTcc = async (req, res, next) => {
  console.log(JSON.stringify(req.body, null, 2));

  // init data
  // get data from db
  let tsc = await Price.findOne({
      order: [["createdAt", "desc"]],
      where: { type: 0, status: true },
    }),
    tcc = await Price.findOne({
      order: [["createdAt", "desc"]],
      where: { type: 1, status: true },
    }),
    tscUnlimitedPrice = await Price.findOne({
      order: [["createdAt", "desc"]],
      where: { type: 2, status: true },
    }),
    tccUnlimitedPrice = await Price.findOne({
      order: [["createdAt", "desc"]],
      where: { type: 3, status: true },
    });

  // client data
  let data = { userId: req.user.id },
    { body } = req; // body: { tsc, tcc }

  // tsc
  if (tsc === "unlimited") {
    data.isTscUnlimited = true;
    data.tscPriceId = tscUnlimitedPrice.id;
  } else {
    data.tsc = Number(body.tsc) || 0;

    // finding price of tsc
    let a = -1,
      v = JSON.parse(tsc.data);
    for (let i = 0; i < v.length; i++) {
      if (v[i].ranges.start <= data.tsc && v[i].ranges.end > data.tsc)
        a = v[i].price;
    }

    if (a === -1) return next(new ErrorResponse("TSC out of range"));

    data.tscMoney = a * data.tsc;
    data.tscPriceId = tsc.id;
  }

  // tcc
  if (tcc === "unlimited") {
    data.isTccUnlimited = true;
    data.tccPriceId = tccUnlimitedPrice.id;
  } else {
    data.tcc = Number(body.tcc) || 0;

    // finding price of tcc
    let a = -1,
      v = JSON.parse(tcc.data);
    for (let i = 0; i < v.length; i++) {
      if (v[i].ranges.start <= data.tcc && v[i].ranges.end > data.tcc)
        a = v[i].price;
    }

    if (a === -1) return next(new ErrorResponse("TSC out of range"));

    data.tccMoney = a * data.tcc;
    data.tccPriceId = tcc.id;
  }

  let payment = await Payment.create(data);

  // res to the client with token
  res.status(200).json({
    success: true,
  });
};

/**
 * check if client can sent invitation
 * action - /v1/payment/tsc/check
 * method - post
 * token
 */
obj.canSendInvitation = async (req, res, next) => {
  // client data
  let { userIds, groupIds } = req.body;

  // validate data
  userIds = userIds || [];
  groupIds = groupIds || [];
  if (!Array.isArray(userIds) || !Array.isArray(groupIds))
    return next(new ErrorResponse("Validation error"));

  let data = await Payment.canSendInvitation(req.user.id, {
    userIds,
    groupIds,
  });

  // client response
  res.status(200).json({
    success: true,
    data: {
      canSend: data.canSend,
      tsc: data.tsc,
      dublicatedUsers: data.dublicatedUsers,
    },
  });
};

/**
 * check if client can create test
 * action - /v1/payment/tcc/check
 * method - post
 * token
 */
obj.canCreateTest = async (req, res, next) => {
  // response db
  let data = await Payment.canCreateTest(req.user.id);

  // client response
  res.status(200).json({
    success: true,
    data: {
      canSend: data.canSend,
      tcc: data.tcc,
    },
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
