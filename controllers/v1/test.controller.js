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
    userId: req.user.id,
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

/**
 * Get one test with their questions
 * action - /v1/tests/:id
 * method - get
 * token
 */
obj.getOne = async (req, res) => {
  // client data
  let { id } = req.params;

  // prepare query options
  let options = {
    where: { id, userId: req.user.id },
    include: [{ association: "Questions" }],
  };

  // request db
  let test = await Test.findOne(options);

  // prepare response data
  let data = {
    id: test.id,
    name: test.name,
    description: test.description,
    questions: test.Questions.map((e) => ({
      id: e.id,
      type: e.type,
      data: e.data,
      isRandom: e.isRandom,
      editable: e.editable,
    })),
  };

  // client response
  res.status(200).json({
    success: true,
    test: data,
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
