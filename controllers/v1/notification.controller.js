"use strict";

const {
  User,
  Notification,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const obj = {};

obj.create = async (req, res) => {
  console.log(JSON.stringify(req.body, null, 2));

  // get from client

  // save to db

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
