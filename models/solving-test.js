"use strict";

const model = (sequelize, DataTypes) => {
  let SolvingTest = sequelize.define(
    "SolvingTest",
    {
      startTime: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "start time of test solving period",
      },
      endTime: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "end time of test solving period",
      },
      solveTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "given time in milliseconds to solve test",
      },
      questionCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "number of question included in the test",
      },
      invitedUsers: {
        type: DataTypes.TEXT,
        defaultValue: JSON.stringify([]),
        allowNull: false,
        comment: "json array, includes ids of invited users",
      },
      participantCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "number of participants",
      },
      correctAnswerAverage: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false,
        comment: "average of correct answers",
      },
      incorrectAnswerAverage: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: false,
        comment: "average of incorrect answers",
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment:
          "false - for private invited users, if true this test for everyone",
      },
      isResultsShared: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: "share test results to other invited users or not",
      },
      isUserResultShared: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: "share test results to other invited users or not",
      },
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      underscored: true,
      paranoid: true,
    }
  );

  SolvingTest.associate = function (models) {
    // associations there
    SolvingTest.belongsTo(models.User, { foreignKey: "userId" });
    SolvingTest.belongsTo(models.Test, { foreignKey: "testId" });
    SolvingTest.hasMany(models.UserResult, { foreignKey: "solvingTestId" });
  };

  return SolvingTest;
};

const methods = ({ SolvingTest }) => {
  SolvingTest.prototype.isTimeToSolve = function (userResult) {
    let NOW = new Date().getTime(),
      res =
        !userResult.finishedAt &&
        userResult.startedAt.getTime() + this.solveTime > NOW;
    if (this.isPublic) return res;
    return res && this.endTime.getTime() > NOW;
  };
  SolvingTest.prototype.isUserInvited = function (userId) {
    if (this.isPublic) return true;
    return JSON.parse(this.invitedUsers).includes(parseInt(userId));
  };
};

module.exports = { model, methods };
