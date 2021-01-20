"use strict";

const {
  User,
  UserResult,
  Question,
  SolvingTest,
  SolvingQuestion,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const { update } = require("./question.controller");
const { ErrorResponse } = require("../../utils");
const obj = {};

/**
 * solve question of one test
 * action - /v1/user-results/:id/questions/:cid
 * method - post
 * token
 */
obj.solveQuestion = async (req, res, next) => {
  // client data
  let userId = req.user.id,
    { id: userResultId, cid: questionId } = req.params,
    { answer } = req.body;

  // request db
  let userResult = await UserResult.findOne({
    where: { id: userResultId },
    include: [{ association: "SolvingTest" }],
  });

  // error test
  if (!userResult) return next(new ErrorResponse("Could not find user-result"));

  let solvingTest = userResult.SolvingTest;

  // permission test
  if (!solvingTest.isUserInvited(userId))
    return next(new ErrorResponse("Permission denied"));

  // time test
  if (!solvingTest.isTimeToSolve(userResult))
    return next(new ErrorResponse("It is not time to solve"));

  // knowing is it correct answer
  let question = await Question.findOne({
    where: { id: questionId },
    attributes: ["type", "data"],
  });
  let isCorrect = question.isAnswerCorrect(answer);

  await SolvingQuestion.upsert(
    { answer, isCorrect },
    { userResultId, questionId }
  );

  // client response
  res.status(200).json({
    success: true,
  });
};

/**
 * remove solved question of one test
 * action - /v1/user-results/:id/questions/:cid
 * method - delete
 * token
 */
obj.removeSolvedQuestion = async (req, res, next) => {
  // client data
  let userId = req.user.id,
    { id: userResultId, cid: questionId } = req.params;

  // request db
  let userResult = await UserResult.findOne({
    where: { id: userResultId },
    include: [{ association: "SolvingTest" }],
  });

  // error test
  if (!userResult) return next(new ErrorResponse("Could not find user-result"));

  let solvingTest = userResult.SolvingTest;

  // permission test
  if (!solvingTest.isUserInvited(userId))
    return next(new ErrorResponse("Permission denied"));

  // time test
  if (!solvingTest.isTimeToSolve(userResult))
    return next(new ErrorResponse("It is not time to solve"));

  // request db
  let updatedRows = await SolvingQuestion.destroy({
    where: { userResultId, questionId },
  });

  // client response
  res.status(200).json({
    success: true,
  });
};

/**
 * get solved questions of one test
 * action - /v1/user-results/:id/questions
 * method - get
 * token
 */
obj.getSolvedQuestions = async (req, res, next) => {
  // client data
  let userResultId = req.params.id,
    userId = req.user.id;

  // request db
  let userResult = await UserResult.findOne({
    where: {
      id: userResultId,
      [Op.or]: [
        {
          finishedAt: { [Op.ne]: null },
        },
        {
          endTime: { [Op.lt]: new Date() },
        },
      ],
    },
  });

  // error test
  if (!userResult) return next(new ErrorResponse("Could not find userResult"));

  let solvingTest = await SolvingTest.findOne({
    where: { id: userResult.solvingTestId },
    attributes: ["id", "testId", "userId"],
  });

  // error test
  if (!(userResult.userId === userId || solvingTest.userId === userId))
    return next(new ErrorResponse("Could not find userResult"));

  let questions = await Question.findAll({
    where: { testId: solvingTest.testId },
    attributes: ["id", "type", "data"],
    include: {
      association: "solvingQuestions",
      where: { userResultId },
      attributes: ["answer", "isCorrect", "createdAt", "updatedAt"],
      required: false,
    },
  });
  // let solvingQuestions = await SolvingQuestion.findAll({
  //   where: { userResultId },
  // });

  // prepare data
  for (let i in questions) {
    questions[i] = {
      id: questions[i].id,
      type: questions[i].type,
      data: questions[i].data,
      userAnswer:
        (questions[i].solvingQuestions.length &&
          questions[i].solvingQuestions[1]) ||
        null,
    };
  }

  // client response
  res.status(200).json({
    success: true,
    userResult,
    questions,
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
