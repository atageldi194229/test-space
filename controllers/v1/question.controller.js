"use strict";

const {
  User,
  Question,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const { v4: uuidv4 } = require("uuid");
const obj = {};

const getQuestionData = {
  singleChoice: function (data, files) {
    const saveFile = (file) => {
      let fileName = uuidv4() + file.name;
      file.mv("public/uploads/question/" + fileName);
      return "/uploads/question/" + fileName;
    };
    if (data.question.audio)
      data.question.audio = saveFile(files[data.question.audio]);
    if (data.question.image)
      data.question.image = saveFile(files[data.question.image]);
    for (let i = 0; i < data.answers.length; i++) {
      if (data.answers[i].type === "image")
        data.answers[i].value = saveFile(files[data.answers[i].value]);
    }
    return data;
  },
};

obj.create = async (req, res, next) => {
  console.log(JSON.stringify(req.body, null, 2));

  // let uploadedFile = req.files.uploadedFile;
  // uploadedFile.mv("./uploadedFiles/" + uploadedFile.name);

  let { data, type, isRandom, testId } = req.body;
  data = JSON.parse(data);
  if (type === "singleChoice")
    data = getQuestionData.singleChoice(data, req.files);

  // save to db
  let question = await Question.create({
    type,
    data: JSON.stringify(data),
    isRandom,
    testId,
  });

  // res to the client with token
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
