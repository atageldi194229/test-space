"use strict";

const {
  User,
  Question,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const { saveFile, deleteFiles } = require("../utils/fileUpload");
const obj = {};

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function saveFilesOfQuestion(type, data, files, edit = false) {
  if (type < 0 || type > 5) return -1;

  if ((edit && data.question.newAudio) || data.question.audio)
    data.question.audio = saveFile(files[data.question.audio], "question");
  if ((edit && data.question.newImage) || data.question.image)
    data.question.image = saveFile(files[data.question.image], "question");

  delete data.question.newAudio;
  delete data.question.newImage;

  if (type === 0 || type === 1) {
    // if singleChoice or multiChoice
    for (let i = 0; i < data.answers.length; i++) {
      if ((edit && data.answers[i].new) || data.answers[i].type === "image")
        data.answers[i].value = saveFile(
          files[data.answers[i].value],
          "question"
        );
      delete data.answers[i].new;
    }
  }

  return data;
}

function randomizeMatchingQuestion(data) {
  for (let i = 0; i < 20; i++) {
    // get random two integer between 0 and arr.length
    let k = getRndInteger(0, data.answers.col2.length);
    let l = getRndInteger(0, data.answers.col2.length);
    // swap values of answers
    let c = data.answers.col2[k].value;
    data.answers.col2[k].value = data.answers.col2[l].value;
    data.answers.col2[l].value = c;

    // swap correct answer keys
    k = data.answers.col1[k].key;
    l = data.answers.col1[l].key;

    c = data.correct[k];
    data.correct[k] = data.correct[l];
    data.correct[l] = c;
  }
  return data;
}

/**
 * Create question
 * action - /v1/questions
 * method - post
 * token
 */
obj.create = async (req, res, next) => {
  // client data
  let { data, type, isRandom, testId } = req.body;

  // save files of data
  data = saveFilesOfQuestion(type, JSON.parse(data), req.files);

  // error test
  if (data === -1) return next(new ErrorResponse("Invalid question type"));
  if (!testId) return next(new ErrorResponse("Invalid testId"));

  // if question type is 'matching' let's randomize it's answers
  if (type === 4) randomizeMatchingQuestion(data);

  // save to db
  let question = await Question.create({
    type,
    data: JSON.stringify(data),
    isRandom,
    testId,
  });

  // client response
  res.status(200).json({
    success: true,
  });
};

/**
 * Update question, type can't be changed
 * action - /v1/questions/:id
 * method - put
 * token
 */
obj.update = async (req, res, next) => {
  // client data
  let id = req.params.id;
  let { data, isRandom, testId, deletedFiles } = req.body;
  let newData = { isRandom, testId };

  // request db
  let question = await Question.findOne({ where: { id } });
  // error test
  if (!question) return next(new ErrorResponse("Question is not found"));

  // test owner of this question
  let test = await Test.findOne({
    where: { id: question.testId, userId: req.user.id },
  });
  // error test
  if (!test) return next(new ErrorResponse("Test is not found"));

  // save files of data if exists and delete trashed files
  if (data) {
    data = saveFilesOfQuestion(type, JSON.parse(data), req.files, true);
    deleteFiles(JSON.parse(deletedFiles));

    // if question type is 'matching' let's randomize it's answers
    if (qusetion.type === 4) randomizeMatchingQuestion(data);

    // add to the new data
    newData.data = JSON.stringify(data);
  }

  // update request db
  await qusetion.update(newData, { where: { id } });

  // client response
  res.status(200).json({
    success: true,
  });
};

/**
 * get one question
 * action - /v1/questions/:id
 * method - get
 * token
 */
obj.getOne = async (req, res, next) => {
  // client data
  let id = req.params.id;

  // request db
  let question = await Question.findOne({ where: { id } });

  // error test
  if (!question) return next(new ErrorResponse("Question is not found"));

  // test owner of this question
  let test = await Test.findOne({
    where: { id: question.testId, userId: req.user.id },
  });
  // error test
  if (!test) return next(new ErrorResponse("Test is not found"));

  // prepare data
  let data = {
    id: question.id,
    type: question.type,
    data: JSON.parse(question.data),
    isRandom: question.isRandom,
    editable: question.editable,
  };

  // client response
  res.status(200).json({
    success: true,
    question: data,
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
