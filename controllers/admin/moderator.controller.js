"use strict";

const {
  PrivilegedUser,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const { JwtService } = require("../../services");
const ErrorResponse = require("../../utils/errorResponse");
const obj = {};

/**
 * get all moderators
 * action - /admin/users
 * method - get
 * token
 * role - a
 */
obj.getAll = async (req, res) => {
  // request db
  let users = await PrivilegedUser.findAll({
    where: { role: "m" },
    attributes: ["id", "username"],
  });

  // client response
  res.status(200).json({
    success: true,
    users,
  });
};

/**
 * Update - moderator username or password
 * action - /admin/users/:id
 * method - put
 * token
 * role - a
 */
obj.update = async (req, res, next) => {
  const { username, password } = req.body,
    id = req.params.id;

  // validate & prepare
  let data = { username };
  if (password) data.password = PrivilegedUser.hashPassword(password);

  // request db
  let updatedRows = await PrivilegedUser.update(data, {
    where: { id, role: "m" },
  });

  // error test
  if (!updatedRows) return next(new ErrorResponse("User is not updated"));

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
