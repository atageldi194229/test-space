"use strict";

const model = (sequelize, DataTypes) => {
  let Test = sequelize.define(
    "Test",
    {
      name: { type: DataTypes.STRING(200) },
      description: { type: DataTypes.TEXT },
      // createdBy: { type: DataTypes.INTEGER},
      image: { type: DataTypes.STRING },
      isRandom: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      defaultSolveTime: {
        type: DataTypes.INTEGER,
        defaultValue: 60 * 60 * 1000,
        allowNull: false,
        comment: "default solve time for public tests",
      },
      likeCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "like count",
      },
      solveCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "like count",
      },
      language: { type: DataTypes.STRING(30) },
      keywords: {
        type: DataTypes.TEXT,
        comment: "Gozleg maksatly",
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      allowedAt: {
        type: DataTypes.DATE,
      },
      archivedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      underscored: true,
      paranoid: true,
    }
  );

  Test.associate = function (models) {
    // associations there

    Test.belongsTo(models.User, { foreignKey: "userId" });

    Test.hasMany(models.Question, { foreignKey: "testId" });
    Test.hasMany(models.SolvingTest, { foreignKey: "testId" });

    Test.belongsToMany(models.User, {
      through: { model: "PinnedTest" },
      // as: "PinnedTests",
      foreignKey: "testId",
    });
  };

  return Test;
};

const methods = ({ Test, PinnedTest }) => {
  Test.prototype.isPinned = async function (userId) {
    let pinnedTest = await PinnedTest.findOne({
      where: { userId, testId: this.id },
    });

    this.isPinned = (pinnedTest && true) || false;
    this.dataValues.isPinned = (pinnedTest && true) || false;
    // this._previousDataValues.isPinned = (pinnedTest && true) || false;
  };

  Test.arePinned = async function (tests, userId) {
    // init
    let isPinnedMap = {};
    // request db
    let pinnedTests = await PinnedTest.findAll({
      where: { userId, testId: tests.map((e) => e.id) },
    });
    // prepare data
    for (let i in pinnedTests) {
      // await tests[i].isPinned(userId);
      isPinnedMap[pinnedTests.testId] = true;
    }
    // finishing
    for (let i in tests) {
      tests[i].isPinned = Boolean(isPinnedMap[tests[i].id]);
      tests[i].dataValues.isPinned = Boolean(isPinnedMap[tests[i].id]);
    }

    return tests;
  };
};

module.exports = { model, methods };
