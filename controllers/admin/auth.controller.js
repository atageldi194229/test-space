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
 * register new privileged user
 * action - /admin/login
 * method - post
 */
obj.register = async (req, res) => {
  let { username, password, role } = req.body;

  // save in the db
  let user = await PrivilegedUser.create({
    username,
    password: PrivilegedUser.hashPassword(password),
    role,
  });

  // create token
  let payload = { id: user.id, role: user.role };
  let token = JwtService.sign(payload);

  // res to the client with token
  res.status(200).json({
    success: true,
    token,
    user: {
      username: user.username,
    },
  });
};

/**
 * Login
 * action - /admin/login
 * method - post
 */
obj.login = async (req, res, next) => {
  const { username, password } = req.body;

  // let's get user by given username
  let user = await PrivilegedUser.findOne({
    where: { username },
    attributes: ["id", "username", "password", "role"],
  });

  // user validation
  if (!user) return next(new ErrorResponse("Username or password is invalid"));

  if (user.comparePassword(password)) {
    // create token
    let payload = { id: user.id, role: user.role };
    let token = JwtService.sign(payload);

    res.status(200).json({
      success: true,
      token,
      user: {
        username: user.username,
      },
    });
  } else {
    return next(new ErrorResponse("Username or password is invalid"));
  }
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
