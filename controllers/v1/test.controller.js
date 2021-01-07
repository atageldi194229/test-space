"use strict";

const {
  User,
  Test,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const { ErrorResponse } = require("../../utils");
const { deleteFile, saveFile } = require("../../utils/fileUpload");
const obj = {};

/**
 * create test
 * action - /v1/tests
 * method - post
 * token
 */
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

  // check if client can create test
  let data = await Payment.canCreateTest(req.user.id);

  // error test
  if (!data.canSend) return next(new ErrorResponse("Could not create test"));

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

  // now let's eat user's tcc
  let isTccUsed = await Payment.useTcc(req.user.id, {
    tccCount: data.tcc.need,
    payments: data.payments,
  });

  // res to the client with token
  res.status(200).json({
    success: true,
    testId: test.id,
  });
};

/**
 * update test data
 * action - /v1/tests/:id
 * method - put
 * token
 */
obj.update = async (req, res, next) => {
  // client data
  let {
      name,
      description,
      isRandom,
      isPublic,
      isAllowed,
      language,
      keywords,
    } = req.body,
    userId = req.user.id,
    id = req.params.id;

  // save to db
  let updatedRows = await Test.update(
    {
      name,
      description,
      isRandom,
      isPublic,
      isAllowed,
      language,
      keywords,
    },
    { where: { userId, id } }
  );

  if (!updatedRows) return next(new ErrorResponse("Couldn't update"));

  // res to the client with token
  res.status(200).json({
    success: true,
  });
};

/**
 * update test image
 * action - /v1/tests/:id/image
 * method - put
 * token
 */
obj.updateImage = async (req, res, next) => {
  // client data
  let userId = req.user.id,
    file = req.files["image"],
    id = req.params.id;

  // request db
  let test = await Test.findOne({
    where: { userId, id },
    attributes: ["image", "userId", "id"],
  });

  // error test
  if (!test) return next(new ErrorResponse("Could not find"));

  if (test.image) deleteFile(test.image);
  let image = saveFile(file, "test");

  // request db (save changes)
  let updatedRows = await test.update({ image });
  if (!updatedRows) return next(new ErrorResponse("Couldn't update"));

  // res to the client with token
  res.status(200).json({
    success: true,
  });
};

/**
 * get all tests by userId
 * action - /v1/tests
 * method - get
 * token
 */
obj.getAll = async (req, res) => {
  // client data
  const userId = req.user.id,
    limit = parseInt(req.params.limit) || 20,
    offset = parseInt(req.params.offset) || 0;

  // get data from db
  let tests = await Test.findAll({
    limit,
    offset,
    order: [["createdAt", "desc"]],
    where: { userId },
    attributes: [
      "id",
      "name",
      "description",
      "isRandom",
      "isPublic",
      "isAllowed",
      "image",
      "language",
      "keywords",
    ],
  });

  res.status(200).json({
    success: true,
    tests,
  });
};

/**
 * get all public tests
 * action - /v1/tests/public
 * method - get
 * token
 */
obj.getPublic = async (req, res) => {
  // client data
  const limit = parseInt(req.params.limit) || 20,
    offset = parseInt(req.params.offset) || 0;

  // request db
  let tests = await Test.findAll({
    limit,
    offset,
    order: [["createdAt", "desc"]],
    where: { isPublic: true },
    attributes: ["id", "name", "description", "image", "language", "keywords"],
  });

  // client data
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
