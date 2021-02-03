"use strict";

const {
  Message,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const obj = {};

/**
 * Create group,
 * action - /v1/messages,
 * method - post,
 * token,
 */
obj.create = async (req, res) => {
  // client data
  let { name, email, text } = req.body;

  // request db
  let message = await Message.create({ name, email, text });

  // client response
  res.status(200).json({
    success: true,
  });
};

// When exporting all collected data
let keys = Object.keys(obj);
// exclude some functions
let excluded_keys = [];
for (let i = 0; i < keys.length; i++)
  if (!excluded_keys.includes(keys[i]))
    obj[keys[i]] = asyncHandler(obj[keys[i]]);
// exporting all functions
module.exports = obj;
