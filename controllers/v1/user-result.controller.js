"use strict";

const {
  User,
  UserResult,
  Question,
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
  if (JSON.parse(solvingTest.invitedUsers).indexOf(parseInt(userId)) === -1)
    return next(new ErrorResponse("Permission denied"));

  // time test
  if (
    !(
      !userResult.finishedAt &&
      userResult.startAt + solvingTest.solveTime > new Date() &&
      solvingTest.endTime > new Date()
    )
  )
    return next(new ErrorResponse("It is not time to solve"));

  // knowing is it correct answer
  let question = await Question({
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
  if (JSON.parse(solvingTest.invitedUsers).indexOf(parseInt(userId)) === -1)
    return next(new ErrorResponse("Permission denied"));

  // time test
  if (
    !(
      !userResult.finishedAt &&
      userResult.startAt + solvingTest.solveTime > new Date() &&
      solvingTest.endTime > new Date()
    )
  )
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

// When exporting all collected data
let keys = Object.keys(obj);
// exclude some functions
let excluded_keys = ["status"];
for (let i = 0; i < keys.length; i++)
  if (!excluded_keys.includes(keys[i]))
    obj[keys[i]] = asyncHandler(obj[keys[i]]);
// exporting all functions
module.exports = obj;
