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
 * get my profile
 * action - /v1/users/my/account
 * method - get
 * token
 */
obj.getMyAccount = async (req, res, next) => {
  // client data
  let id = req.user.id;

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
    where: { id },
    attributes: [...keys.map((e) => e), ...keys.map((e) => e + "A")],
  });

  // client response
  res.status(200).json({
    success: true,
    user,
  });
};

/**
 * update my profile
 * action - /v1/users/my/account
 * method - put
 * token
 */
obj.updateMyAccount = async (req, res, next) => {
  // client data
  let id = req.user.id;

  let keys = [
    "firstName",
    "lastName",
    "birthDate",
    "country",
    "city",
    "gender",
    "job",
    "bio",
  ];

  // prepare data to update
  let data = {};
  for (let key in keys) {
    data[key] = req.body[key];
    data[key] = req.body[key + "A"];
  }

  // request db
  let user = await User.update(data, { where: { id } });

  // client response
  res.status(200).json({
    success: true,
  });
};

/**
 * update my image
 * action - /v1/users/my/account/image
 * method - put
 * token
 */
obj.updateMyAccountImage = async (req, res, next) => {
  // client data
  let id = req.user.id,
    file = req.files["image"];

  // request db
  let user = await User.findOne({
    where: { id },
    attributes: ["image", "id"],
  });

  if (user.image) deleteFile(user.image);
  let image = saveFile(file, "user");

  // request db (save changes)
  let updatedRows = await user.update({ image });
  if (!updatedRows) return next(new ErrorResponse("Couldn't update"));

  // res to the client with token
  res.status(200).json({
    success: true,
  });
};

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
      active: true,
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
 * get user by id
 * action - /v1/users/:id
 * method - get
 * token
 */
obj.getOne = async (req, res, next) => {
  // client data
  let { id } = req.params;

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
    where: { id },
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
