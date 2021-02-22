"use strict";

const {
  User,
  SolvingTest,
  SolvingQuestion,
  UserResult,
  Test,
  Question,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const { ErrorResponse, randomizeArray } = require("../../utils");
const { firebase } = require("googleapis/build/src/apis/firebase");
const obj = {};

const Tools = {
  filter: (s) => {
    let where = {};
    if (s === "public") {
      where.isPublic = true;
    } else if (s === "private") {
      where.isPublic = false;
    }

    return where;
  },

  sort: (s) => {
    try {
      // validate data
      let a = s.split("-");
      a[1] = a[1].toLowerCase();

      let k = ["isPublic", "createdAt"];

      if (k.includes(a[0]) && ["asc", "desc"].includes(a[1])) {
        return [a[0], a[1]];
      }
    } catch (err) {}
    return ["createdAt", "desc"];
  },
};

/**
 * Get all invitation of user
 * action - /v1/solving-tests
 * method - get
 * token
 */
obj.getAll = async (req, res) => {
  // client data
  let userId = req.user.id,
    limit = Number(req.query.limit) || 20,
    offset = Number(req.query.offset) || 0,
    sort = req.query.sort,
    filter = req.query.filter;

  // request db
  let solvingTests = await SolvingTest.findAll({
    limit,
    offset,
    order: [Tools.sort(sort)],
    where: { userId, ...Tools.filter(filter) },
    include: [
      {
        association: "Test",
        where: {
          allowedAt: sequelize.literal(
            "(`SolvingTest`.`is_public` = FALSE OR `Test`.`allowed_at` IS NOT NULL AND `Test`.`is_public` = TRUE)"
          ),
        },
        attributes: [
          "id",
          "name",
          "description",
          "image",
          "language",
          "keywords",
        ],
      },
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
      isPublic: e.isPublic,
      isResultsShared: e.isResultsShared,
      createdAt: e.createdAt,
      test: {
        id: e.Test.id,
        name: e.Test.name,
        description: e.Test.description,
        image: e.Test.image,
        language: e.Test.language,
        keywords: e.Test.keywords,
      },
    })),
  });
};

/**
 * Get one shared test
 * action - /v1/solving-tests/:id
 * method - get
 * token
 */
obj.getOne = async (req, res) => {
  // client data
  let userId = parseInt(req.user.id),
    id = req.params.id;

  let solvingTest = await SolvingTest.findOne({
    where: { id },
    attributes: [
      "id",
      "questionCount",
      "testId",
      "invitedUsers",
      "userId",
      "isResultsShared",
    ],
  });

  // error test
  if (!solvingTest)
    return next(new ErrorResponse("Could not find solving test"));

  // parse json
  let invitedUsers = JSON.parse(solvingTest.invitedUsers);

  // permission test
  if (
    !(solvingTest.isResultsShared && invitedUsers.includes(userId)) ||
    solvingTest.userId !== userId
  ) {
    return next(new ErrorResponse("Permission denied"));
  }

  let userResults = await UserResult.findAll({
    order: [["createdAt", "desc"]],
    where: {
      solvingTestId: solvingTest.id,
      [Op.or]: [
        {
          finishedAt: { [Op.ne]: null },
        },
        {
          endTime: { [Op.lt]: new Date() },
        },
      ],
    },
    attributes: {
      exclude: ["updatedAt", "solvingTestId"],
    },
  });

  // array => object
  let ur = {};
  for (let r of userResults) {
    ur[r.userId] = r;
  }

  let users = User.findAll({
    where: { id: invitedUsers },
    attributes: ["id", "username", "image", "firstName", "lastName"],
  });

  // request db
  let test = await Test.findOne({
    where: { id: solvingTest.testId },
    attributes: {
      exclude: ["updatedAt"],
    },
  });

  // client response
  res.status(200).json({
    success: true,
    solvingTest,
    test,
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      image: u.image,
      firstName: u.firstName,
      lastName: u.lastName,
      userResult: ur[u.id] && {
        totalPoints:
          (100 * ur[u.id].correctAnswerCount) / solvingTest.questionCount,
        correctAnswerCount: ur[u.id].correctAnswerCount,
        incorrectAnswerCount: ur[u.id].incorrectAnswerCount,
        emptyAnswerCount:
          solvingTest.questionCount -
          ur[u.id].correctAnswerCount -
          ur[u.id].incorrectAnswerCount,

        percentage: {
          correctAnswer:
            (100 * ur[u.id].correctAnswerCount) / solvingTest.questionCount,
          incorrectAnswer:
            (100 * ur[u.id].incorrectAnswerCount) / solvingTest.questionCount,
          emptyAnswer:
            (100 *
              (solvingTest.questionCount -
                ur[u.id].correctAnswerCount -
                ur[u.id].incorrectAnswerCount)) /
            solvingTest.questionCount,
        },

        startedAt: ur[u.id].startedAt,
        finishedAt: ur[u.id].finishedAt || ur[u.id].endTime,
      },
    })),
  });
};

/**
 * Update solvingTest
 * action - /v1/solving-test/:id
 * method - put
 * token
 */
obj.update = async (req, res, next) => {
  // client data
  let id = req.params.id;
  let userId = req.user.id;
  let { isResultsShared } = req.body;

  // request db
  let solvingTest = await SolvingTest.findOne({
    where: { id, userId },
    attributes: ["id", "isResultsShared"],
  });

  // error test
  if (!solvingTest)
    return next(new ErrorResponse("Could not find solving test"));

  // update request db
  await solvingTest.update({ isResultsShared }, { where: { id } });

  // client response
  res.status(200).json({
    success: true,
  });
};

/**
 * Get all invitation of user
 * action - /v1/solving-tests
 * method - get
 * token
 */
obj.search = async (req, res) => {
  // client data
  let userId = req.user.id,
    limit = Number(req.query.limit) || 20,
    offset = Number(req.query.offset) || 0,
    sort = req.query.sort,
    filter = req.query.filter,
    text = (req.body.text || "").toLowerCase();

  // request db
  let solvingTests = await SolvingTest.findAll({
    limit,
    offset,
    order: [Tools.sort(sort)],
    where: {
      userId,
      ...Tools.filter(filter),
      [Op.or]: [
        {
          name: sequelize.where(
            sequelize.fn("LOWER", sequelize.col("Test.name")),
            "LIKE",
            "%" + text + "%"
          ),
        },
        {
          keywords: sequelize.where(
            sequelize.fn("LOWER", sequelize.col("Test.keywords")),
            "LIKE",
            "%" + text + "%"
          ),
        },
      ],
    },
    include: [
      {
        association: "Test",
        where: {
          allowedAt: sequelize.literal(
            "(`SolvingTest`.`is_public` = FALSE OR `Test`.`allowed_at` IS NOT NULL AND `Test`.`is_public` = TRUE)"
          ),
        },
        attributes: [
          "id",
          "name",
          "description",
          "image",
          "language",
          "keywords",
        ],
      },
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
      isPublic: e.isPublic,
      isResultsShared: e.isResultsShared,
      createdAt: e.createdAt,
      test: {
        id: e.Test.id,
        name: e.Test.name,
        description: e.Test.description,
        image: e.Test.image,
        language: e.Test.language,
        keywords: e.Test.keywords,
      },
    })),
  });
};

/**
 * check can solve test
 * action - /v1/solving-tests/:id/can-solve
 * method - get
 * token
 */
obj.canSolveTest = async (req, res, next) => {
  // client data
  let userId = req.user.id,
    solvingTestId = req.params.id;

  // request db
  let solvingTest = await SolvingTest.findOne({
    where: { id: solvingTestId, userId },
    include: [
      {
        association: "Test",
        attributes: ["id", "name", "description", "isRandom", "image"],
      },
    ],
  });

  // error test
  if (!solvingTest) return next(new ErrorResponse("Something went wrong"));
  if (JSON.parse(solvingTest.invitedUsers).indexOf(parseInt(userId)) === -1)
    return next(new ErrorResponse("Could not find route", null, 404));

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
      image: solvingTest.Test.image,
    },
  };
  if (solvingTest.startTime.getTime() > new Date()) {
    data.status = "waiting";
    data.leftTime = new Date() - solvingTest.startTime.getTime();
  } else if (solvingTest.endTime.getTime() < new Date()) {
    data.status = "ended";
  } else {
    let userResult = await UserResult.findOne({
      where: { solvingTestId, userId },
    });

    if (
      userResult &&
      !userResult.finishedAt &&
      userResult.startedAt.getTime() + solvingTest.solveTime > new Date() &&
      solvingTest.endTime.getTime() > new Date()
    ) {
      data.status = "solving";
    } else {
      data.status = "active";
      data.leftTime = solvingTest.endTime.getTime() - new Date();
    }
  }

  // client response
  res.status(200).json({
    success: true,
    ...data,
  });
};

/**
 * solve test
 * action - /v1/solving-tests/:id/start-solve
 * method - post
 * token
 */
obj.startSolvingTest = async (req, res, next) => {
  // client data
  let userId = req.user.id,
    solvingTestId = req.params.id;

  // request db
  let solvingTest = await SolvingTest.findOne({
    where: { id: solvingTestId, userId },
    include: [
      {
        association: "Test",
        attributes: ["id", "name", "description", "isRandom"],
      },
    ],
  });

  // error test
  if (!solvingTest) return next(new ErrorResponse("Something went wrong"));
  // permission test`
  if (!JSON.parse(solvingTest.invitedUsers).includes(parseInt(userId)))
    return next(new ErrorResponse("Permission denied"));

  // test to not editable
  await Test.update(
    { isEditable: false },
    { where: { id: solvingTest.testId } }
  );

  // prepare data
  let data = {};
  let NOW = new Date();
  if (
    solvingTest.startTime.getTime() < NOW.getTime() &&
    solvingTest.endTime.getTime() > NOW.getTime()
  ) {
    // request db
    let userResult = await UserResult.findOne({
      where: { solvingTestId, userId },
    });

    if (!userResult) {
      userResult = await UserResult.create({
        startedAt: NOW,
        solvingTestId,
        userId,
        endTime: new Date(NOW.getTime() + solvingTest.solveTime),
      });
    } else if (solvingTest.isTimeToSolve(userResult)) {
      data.status = "solving";
    } else {
      return next(new ErrorResponse("It is not time to solve", -1, 505));
    }
    data.userResultId = userResult.id;

    let questions = await Question.findAll({
      where: { testId: solvingTest.testId },
    });

    // prepare questions
    data.questions = questions.map((e) => ({
      id: e.id,
      type: e.type,
      data: e.getPreparedData(),
    }));

    if ((solvingTest.Test.isRandom = true))
      randomizeArray(data.questions, data.questions.length * 3);

    // now get already solved questions
    data.solvedQuestions = await SolvingQuestion.findAll({
      where: { userResultId: userResult.id },
      attributes: ["questionId", "answer"],
    });

    if (solvingTest.solveTime + new Date() < solvingTest.endTime.getTime())
      data.leftTime =
        userResult.startedAt.getTime() + solvingTest.solveTime - new Date();
    else data.leftTime = solvingTest.endTime.getTime() - new Date();
  } else {
    return next(new ErrorResponse("It is not time to solve", -1, 505));
  }

  // client response
  res.status(200).json({
    success: true,
    ...data,
  });
};

/**
 * finish solving test
 * action - /v1/solving-tests/:id/finish-solve
 * method - post
 * token
 */
obj.finishSolvingTest = async (req, res, next) => {
  // client data
  let userId = req.user.id,
    solvingTestId = req.params.id,
    like = req.body.like || 0;

  // request db
  let userResult = await UserResult.findOne({
    where: { userId, solvingTestId, finishedAt: null },
  });

  if (userResult) await userResult.update({ finishedAt: new Date() });

  // increment like count of test
  if (like) {
    let solvingTest = await SolvingTest.findOne({
      where: { id: solvingTestId },
      attributes: ["testId"],
    });

    let updatedRows = await Test.increment(
      { likeCount: like },
      { where: { id: solvingTest.testId } }
    );
  }

  // client response
  res.status(200).json({
    success: true,
  });
};

/**
 * check status of solving-tests
 * action - /v1/solving-tests/:id/check-status
 * method - get
 * token
 */
obj.checkStatus = async (req, res, next) => {
  // client data
  let userId = req.user.id,
    solvingTestId = req.params.id;

  // request db
  let solvingTest = await SolvingTest.findOne({
    where: { id: solvingTestId, userId, isPublic: true },
    include: [
      {
        association: "Test",
        attributes: ["id", "name", "description", "isRandom"],
      },
    ],
  });

  // error test
  if (!solvingTest) return next(new ErrorResponse("Test is not found"));

  // prepare data
  let data = {};
  data.user = await User.findOne({
    where: { id: solvingTest.userId },
    attributes: ["id", "username", "image"],
  });
  data.solvingTest = {
    solveTime: solvingTest.solveTime,
    test: {
      id: solvingTest.Test.id,
      name: solvingTest.Test.name,
      description: solvingTest.Test.description,
    },
  };

  let userResult = await UserResult.findOne({
    where: {
      solvingTestId,
      userId,
      finishedAt: null,
      startedAt: { [Op.gte]: new Date(new Date() - solvingTest.solveTime) },
    },
  });

  if (userResult) {
    data.status = "solving";
  } else {
    data.status = "active";
  }

  // client response
  res.status(200).json({
    success: true,
    ...data,
  });
};

/**
 * start solve public test
 * action - /v1/solving-tests/:id/start-solve-public
 * method - post
 * token
 */
obj.startSolvingPublicTest = async (req, res, next) => {
  // client data
  let userId = req.user.id,
    solvingTestId = req.params.id;

  // request db
  let solvingTest = await SolvingTest.findOne({
    where: { id: solvingTestId, isPublic: true },
    include: [
      {
        association: "Test",
        attributes: ["id", "name", "description", "isRandom"],
      },
    ],
  });

  // error test
  if (!solvingTest) return next(new ErrorResponse("Test is not found"));

  // test to not editable
  await Test.update(
    { isEditable: false },
    { where: { id: solvingTest.testId } }
  );

  // prepare data
  let data = {};
  data.user = await User.findOne({
    where: { id: solvingTest.userId },
    attributes: ["id", "username", "image"],
  });
  data.solvingTest = {
    solveTime: solvingTest.solveTime,
    test: {
      id: solvingTest.Test.id,
      name: solvingTest.Test.name,
      description: solvingTest.Test.description,
    },
  };

  let userResult = await UserResult.findOne({
    where: {
      solvingTestId,
      userId,
      finishedAt: null,
      startedAt: { [Op.gte]: new Date(new Date() - solvingTest.solveTime) },
    },
  });

  if (!userResult) {
    let NOW = new Date();
    userResult = await UserResult.create({
      startedAt: NOW,
      solvingTestId,
      userId,
      endTime: new Date(NOW.getTime() + solvingTest.solveTime),
    });
  } else {
    data.status = "solving";
  }

  if (userResult && solvingTest.isTimeToSolve(userResult)) {
    data.status = "solving";
  } else {
    data.status = "active";
  }

  data.userResultId = userResult.id;

  let questions = await Question.findAll({
    where: { testId: solvingTest.testId },
  });

  // prepare questions
  data.questions = questions.map((e) => ({
    id: e.id,
    type: e.type,
    data: e.getPreparedData(),
  }));

  if ((solvingTest.Test.isRandom = true))
    randomizeArray(data.questions, data.questions.length * 3);

  // now get already solved questions
  data.solvedQuestions = await SolvingQuestion.findAll({
    where: { userResultId: userResult.id },
    attributes: ["questionId", "answer"],
  });

  data.leftTime =
    solvingTest.solveTime - (new Date() - userResult.startedAt.getTime());

  // client response
  res.status(200).json({
    success: true,
    ...data,
  });
};

/**
 * finish solving public test
 * action - /v1/solving-tests/:id/finish-solve-public
 * method - post
 * token
 */
obj.finishSolvingPublicTest = async (req, res, next) => {
  // client data
  let userId = req.user.id,
    solvingTestId = req.params.id,
    like = req.body.like || 0;

  // request db
  let solvingTest = await SolvingTest.findOne({
    where: { id: solvingTestId, isPublic: true },
    include: [
      {
        association: "Test",
        attributes: ["id", "name", "description", "isRandom"],
      },
    ],
  });

  let userResult = await UserResult.findOne({
    where: {
      solvingTestId,
      userId,
      finishedAt: null,
      startedAt: { [Op.gte]: new Date(new Date() - solvingTest.solveTime) },
    },
  });

  if (userResult) await userResult.update({ finishedAt: new Date() });

  // increment like count of test
  if (like) {
    let updatedRows = await Test.increment(
      { likeCount: like },
      { where: { id: solvingTest.testId } }
    );
  }

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
