"use strict";

const {
  User,
  Question,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const { v4: uuidv4 } = require("uuid");
const obj = {};

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function saveFilesOfQuestion(type, data, files) {
  const saveFile = (file) => {
    let fileName = uuidv4() + file.name;
    file.mv("public/uploads/question/" + fileName);
    return "/uploads/question/" + fileName;
  };

  if (type < 0 || type > 5) return -1;

  if (data.question.audio)
    data.question.audio = saveFile(files[data.question.audio]);
  if (data.question.image)
    data.question.image = saveFile(files[data.question.image]);

  if (type === 0 || type === 1) {
    // if singleChoice or multiChoice
    for (let i = 0; i < data.answers.length; i++) {
      if (data.answers[i].type === "image")
        data.answers[i].value = saveFile(files[data.answers[i].value]);
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

obj.create = async (req, res, next) => {
  console.log(JSON.stringify(req.body, null, 2));

  // client data
  let { data, type, isRandom, testId } = req.body;

  // save files of data
  data = saveFilesOfQuestion(type, JSON.parse(data), req.files);

  // error test
  if (data === -1) return next(new ErrorResponse("Invalid question type"));

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

// When exporting all collected data
let keys = Object.keys(obj);
// exclude some functions
let excluded_keys = ["status"];
for (let i = 0; i < keys.length; i++)
  if (!excluded_keys.includes(keys[i]))
    obj[keys[i]] = asyncHandler(obj[keys[i]]);
// exporting all functions
module.exports = obj;
