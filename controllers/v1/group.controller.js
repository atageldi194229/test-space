"use strict";

const {
  User,
  Group,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const { v4: uuidv4 } = require("uuid");
const obj = {};

obj.create = async (req, res) => {
  console.log(JSON.stringify(req.body, null, 2));

  let { text } = req.body;

  text = text.toLowerCase();

  let users = await User.findAll({
    where: {
      username: sequelize.where(
        sequelize.fn("LOWER", sequelize.col("User.username")),
        "LIKE",
        "%" + text + "%"
      ),
    },
    order: [[sequelize.fn("LENGTH", sequelize.col("User.username")), "ASC"]],
    attributes: ["id", "username"],
  });

  // res to the client with token
  res.status(200).json({
    success: true,
    users,
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
