"use strict";

const {
  User,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const { v4: uuidv4 } = require("uuid");
const obj = {};

/**
 * Search users by their username
 * action - /v1/users/find
 * method - post
 * token
 */
obj.findUsers = async (req, res) => {
  console.log(JSON.stringify(req.body, null, 2));

  // client data
  let { text } = req.body;

  // validate data
  text = text && "";
  text = text.toLowerCase();

  // request db
  let users = await User.findAll({
    where: {
      username: sequelize.where(
        sequelize.fn("LOWER", sequelize.col("User.username")),
        "LIKE",
        "%" + text + "%"
      ),
    },
    order: [[sequelize.fn("LENGTH", sequelize.col("User.username")), "ASC"]],
    attributes: ["id", "username", "image"],
  });

  // client response
  res.status(200).json({
    success: true,
    users,
  });
};

/**
 * get user by username
 * action - /v1/users/atasan
 * method - get
 * token
 */
obj.getOneByName = async (req, res, next) => {
  // client data
  let { username } = req.params;

  let keys = [
    "username",
    "firstName",
    "lastName",
    "email",
    "image",
    "birthDate",
    "phoneNumber",
    "country",
    "city",
    "gender",
    "job",
    "bio",
  ];

  // request db
  let user = await User.findOne({
    where: { username },
    attributes: [...keys.map((e) => e), ...keys.map((e) => e + "A")],
  });

  // preapare data
  let resData = {};

  // remove private infos
  for (let i in keys) {
    if (user[keys[i] + "A"] === true) resData[keys[i]] = user[keys[i]];
  }

  // username, image always public
  resData.username = user.username;
  resData.image = user.image;

  // client response
  res.status(200).json({
    success: true,
    user: resData,
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
