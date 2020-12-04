"use strict";

const {
  User,
  Test,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const { v4: uuidv4 } = require("uuid");
const obj = {};

obj.create = async (req, res) => {
  console.log(JSON.stringify(req.body, null, 2));

  // get from client
  let {
    name,
    description,
    isRandom,
    isPublic,
    isAllowed,
    language,
    keywords,
  } = req.body;

  // save to db
  let test = await Test.create({
    name,
    description,
    isRandom,
    isPublic,
    isAllowed,
    language,
    keywords,
  });

  // res to the client with token
  res.status(200).json({
    success: true,
    testId: test.id,
  });
};

// temporary function
obj.getAll = async (req, res) => {
  // get data from db
  let tests = await Test.findAll();

  res.status(200).json({
    success: true,
    tests,
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
