"use strict";

const {
  User,
  Test,
  Payment,
  PinnedTest,
  UserResult,
  SolvingTest,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const { ErrorResponse } = require("../../utils");
const { deleteFile, saveFile } = require("../../utils/fileUpload");
const obj = {};

// custom tools as functions

/**
 * Filter tests
 * @param {string} s - filter by what
 */
function filterTests(s) {
  let where = {};
  if (s === "public") {
    where.isPublic = true;
    where.allowedAt = {
      [Op.ne]: null,
    };
  } else if (s === "private") {
    where.isPublic = false;
  } else if (s === "waiting") {
    where.isPublic = true;
    where.allowedAt = null;
  } else if (s === "editable") {
    where.editable = true;
  } else if (s === "non-editable") {
    where.editable = false;
  }

  return where;
}

/**
 * Sort by given data
 * @param {string} s - name-asc
 */
function sortTests(s) {
  try {
    // validate data
    let a = s.split("-");
    a[1] = a[1].toLowerCase();

    let k = ["name", "likeCount", "solveCount", "createdAt"];

    if (k.includes(a[0]) && ["asc", "desc"].includes(a[1])) {
      return [a[0], a[1]];
    }
  } catch (err) {}
  return ["createdAt", "desc"];
}

async function prepareOptions(action, { userId, limit, offset, sort, filter }) {
  let ch = {
    actions: [
      "all",
      "public",
      "latest",
      "popular",
      "archived",
      "solved",
      "pinned",
    ],
    sorts: ["all", "public", "archived", "solved", "pinned"],
    filters: ["all", "archived"],
  };

  let publicAttributes = [
      "id",
      "name",
      "description",
      "defaultSolveTime",
      "likeCount",
      "solveCount",
      "image",
      "language",
      "keywords",
    ],
    privateAttributes = ["isRandom", "isPublic", "allowedAt"]; //isRandom, isPublic, allowedAt

  let options = { limit, offset, where: {}, attributes: publicAttributes };

  if (ch.sorts.includes(action)) options.order = [sortTests(sort)];
  if (ch.filters.includes(filter)) {
    options.where = { ...options.where, ...filterTests(filter) };
    options.attributes = [...options.attributes, ...privateAttributes];
  }

  switch (action) {
    case "all":
      options.where = { ...options.where, ...{ userId, archivedAt: null } };
      break;

    case "public":
      options.where = {
        ...options.where,
        ...{
          isPublic: true,
          allowedAt: {
            [Op.ne]: null,
          },
          archivedAt: null,
        },
      };
      break;

    case "latest":
      options.order = [["allowedAt", "desc"]];
      options.where = {
        ...options.where,
        ...{
          isPublic: true,
          allowedAt: {
            [Op.ne]: null,
          },
          archivedAt: null,
        },
      };
      break;

    case "popular":
      let threeMonths = 3 * 30 * 24 * 60 * 60 * 1000;

      options.order = sequelize.literal("(solve_count * 2 + like_count) desc");
      options.where = {
        ...options.where,
        ...{
          isPublic: true,
          allowedAt: {
            [Op.gte]: new Date(new Date() - threeMonths),
          },
          archivedAt: null,
        },
      };
      break;

    case "archived":
      options.where = {
        ...options.where,
        ...{
          userId,
          archivedAt: {
            [Op.ne]: null,
          },
        },
      };
      break;

    case "solved":
      let userResults = await UserResult.findAll({
        where: {
          userId,
          [Op.or]: [
            {
              finishedAt: { [Op.ne]: null },
            },
            {
              endTime: { [Op.lt]: new Date() },
            },
          ],
        },
        attributes: ["solvingTestId"],
      });

      let solvingTests = await SolvingTest.findAll({
        where: { id: userResults.map((e) => e.solvingTestId) },
        attributes: ["testId"],
      });

      options.where = {
        ...options.where,
        ...{
          id: solvingTests.map((e) => e.testId),
          isPublic: true,
          allowedAt: {
            [Op.ne]: null,
          },
          archivedAt: null,
        },
      };
      break;

    case "pinned":
      let testIds = await PinnedTest.findAll({
        where: { userId },
        attributes: ["testId"],
      });

      options.where = {
        ...options.where,
        ...{
          id: testIds.map((e) => e.testId),
          isPublic: true,
          allowedAt: {
            [Op.ne]: null,
          },
          archivedAt: null,
        },
      };

      break;

    default:
    // default
  }

  return options;
}

// end of custom tools as functions

/**
 * create test
 * action - /v1/tests
 * method - post
 * token
 */
obj.create = async (req, res, next) => {
  console.log(JSON.stringify(req.body, null, 2));

  // get from client
  let {
    name,
    description,
    isRandom,
    isPublic,
    defaultSolveTime,
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
    defaultSolveTime,
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
      defaultSolveTime,
      language,
      keywords,
      archive,
    } = req.body,
    archivedAt,
    userId = req.user.id,
    id = req.params.id;

  // validate data
  if (typeof archive !== "undefined") archivedAt = archive ? new Date() : null;

  // save to db
  let updatedRows = await Test.update(
    {
      name,
      description,
      isRandom,
      isPublic,
      defaultSolveTime,
      language,
      keywords,
      archivedAt,
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
 * Get one test with their questions
 * action - /v1/tests/:id
 * method - get
 * token
 */
obj.getOne = async (req, res, next) => {
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

/**
 * Get one test with their questions
 * action - /v1/tests/:id/public
 * method - get
 * token
 */
obj.getOnePublic = async (req, res, next) => {
  // client data
  let { id } = req.params;

  // prepare query options
  let options = {
    where: {
      id,
      isPublic: true,
      allowedAt: {
        [Op.ne]: null,
      },
      archivedAt: null,
    },
    include: [
      {
        association: "User",
        attributes: ["id", "username", "image"],
      },
    ],
  };

  // request db
  let test = await Test.findOne(options);

  // error test
  if (!test) return next(new ErrorResponse("Could not find test"));

  // prepare response data
  let data = {
    id: test.id,
    name: test.name,
    description: test.description,
    image: test.image,
    defaultSolveTime: test.defaultSolveTime,
    likeCount: test.likeCount,
    solveCount: test.solveCount,
    language: test.language,
    keywords: test.keywords,
    user: test.User,
  };

  // client response
  res.status(200).json({
    success: true,
    test: data,
  });
};

/**
 * search tests
 * action - /v1/tests/search
 * method - post
 * token
 */
obj.search = async (req, res, next) => {
  // client data
  let userId = req.user.id,
    limit = parseInt(req.query.limit) || 20,
    offset = parseInt(req.query.offset) || 0,
    sort = req.query.sort,
    filter = req.query.filter,
    text = req.body.text || "",
    action = req.body.action || "public";

  // validate
  text = text.toLowerCase();

  // prepare options
  let options = await prepareOptions(action, {
    userId,
    limit,
    offset,
    sort,
    filter,
  });

  // search options
  options.where = {
    ...options.where,
    ...{
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
  };

  // request db
  let tests = await Test.findAll(options);

  res.status(200).json({
    success: true,
    tests,
  });
};

// multi controller
const get = (action) => async (req, res) => {
  // client data
  const userId = req.user.id,
    limit = parseInt(req.query.limit) || 20,
    offset = parseInt(req.query.offset) || 0,
    sort = req.query.sort,
    filter = req.query.filter;

  // prepare options
  let options = await prepareOptions(action, {
    userId,
    limit,
    offset,
    sort,
    filter,
  });

  // request db
  let tests = await Test.findAll(options);

  // client data
  res.status(200).json({
    success: true,
    tests,
  });
};

// duo controller
const pinningTest = (action) => async (req, res) => {
  // client data
  const testId = req.params.id,
    userId = req.user.id;

  // request db
  let updatedRows;
  if (action === "create")
    updatedRows = await PinnedTest.create({ testId, userId }).catch(() => {});
  else
    updatedRows = await PinnedTest.destroy({
      where: { testId, userId },
    }).catch(() => {});

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
obj.getAll = get("all");

/**
 * get all public tests
 * action - /v1/tests/public
 * method - get
 * token
 */
obj.getPublic = get("public");

/**
 * get all latest allowed public tests
 * action - /v1/tests/latest
 * method - get
 * token
 */
obj.getLatest = get("latest");

/**
 * get all popular tests
 * action - /v1/tests/popular
 * method - get
 * token
 */
obj.getPopular = get("popular");

/**
 * get all archived tests
 * action - /v1/tests/archived
 * method - get
 * token
 */
obj.getArchived = get("archived");

/**
 * get all solved tests
 * action - /v1/tests/solved
 * method - get
 * token
 */
obj.getSolved = get("solved");

/**
 * get all pinned tests
 * action - /v1/tests/pinned
 * method - get
 * token
 */
obj.getPinned = get("pinned");

/**
 * pin one test
 * action - /v1/tests/:id/pin
 * method - post
 * token
 */
obj.pin = pinningTest("create");

/**
 * un pin one test
 * action - /v1/tests/:id/unpin
 * method - post
 * token
 */
obj.unpin = pinningTest("destroy");

// When exporting all collected data
let keys = Object.keys(obj);
// exclude some functions
let excluded_keys = ["status"];
for (let i = 0; i < keys.length; i++)
  if (!excluded_keys.includes(keys[i]))
    obj[keys[i]] = asyncHandler(obj[keys[i]]);
// exporting all functions
module.exports = obj;
