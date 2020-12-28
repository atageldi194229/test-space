"use strict";

const {
  User,
  SolvingTest,
  Test,
  Question,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const { ErrorResponse, randomizeArray } = require("../../utils");
const obj = {};

/**
 * Get all invitation of user
 * action - /v1/solving-tests
 * method - get
 * token
 */
obj.getAll = async (req, res) => {
  // client data
  let userId = req.user.id,
    limit = Number(req.query.limit) || 50,
    offset = Number(req.query.offset) || 0;

  // request db
  let solvingTests = await SolvingTest.findAll({
    limit,
    offset,
    where: { userId },
    include: [
      { association: "Test", attributes: ["id", "name", "description"] },
    ],
  });

  // client response
  res.status(200).json({
    success: true,
    solvingTests: solvingTests.map((e) => ({
      id: e.id,
      startTime: e.startTime,
      endTime: e.endTime,
      solveTime: e.solveTime,
      questionCount: e.questionCount,
      invitedUsers: e.invitedUsers,
      participantCount: e.participantCount,
      correctAnswerAverage: e.correctAnswerAverage,
      incorrectAnswerAverage: e.incorrectAnswerAverage,
      createdAt: e.createdAt,
      test: {
        id: e.Test.id,
        name: e.Test.name,
        description: e.Test.description,
      },
    })),
  });
};

/**
 * solve test
 * action - /v1/solving-tests/:id/solve
 * method - get
 * token
 */
obj.solveTest = async (req, res, next) => {
  // client data
  let userId = req.user.id,
    id = req.params.id;

  // request db
  let solvingTest = await SolvingTest.findOne({
    where: { id, userId },
    include: [
      {
        association: "Test",
        attributes: ["id", "name", "description", "isRandom"],
      },
    ],
  });

  // error test
  if (!solvingTest) return next(new ErrorResponse("Something went wrong"));
  if (JSON.parse(solvingTest.invitedUsers).indexOf(parseInt(userId)) === -1)
    return next(new ErrorResponse("Could not find route", 404));

  // prepare data
  let data = {};
  data.user = await User.findOne({
    where: { id: solvingTest.userId },
    attributes: ["id", "username", "image"],
  });
  data.solvingTest = {
    startTime: solvingTest.startTime,
    endTime: solvingTest.endTime,
    solveTime: solvingTest.solveTime,
    test: {
      id: solvingTest.Test.id,
      name: solvingTest.Test.name,
      description: solvingTest.Test.description,
    },
  };
  if (solvingTest.startTime > new Date()) {
    data.status = "waiting";
    data.leftTime = new Date() - solvingTest.startTime;
  } else if (solvingTest.endTime < new Date()) {
    data.status = "ended";
  } else {
    data.status = "active";

    // request db
    let questions = await Question.findAll({
      where: { testId: solvingTest.testId },
    });

    // prepare questions
    data.test.questions = questions.map((e) => ({
      id: e.id,
      type: e.type,
      data: e.getPreparedData(),
    }));

    if ((solvingTest.Test.isRandom = true))
      randomizeArray(data.test.questions, data.test.questions.length * 3);
  }

  // client response
  res.status(200).json({
    success: true,
    ...data,
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
