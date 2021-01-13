"use strict";

const model = (sequelize, DataTypes) => {
  let UserResult = sequelize.define(
    "UserResult",
    {
      startedAt: {
        type: DataTypes.DATE,
        comment: "time when user started to solve test",
      },
      finishedAt: {
        type: DataTypes.DATE,
        comment: "time when user finished to solve test",
      },
      endTime: {
        type: DataTypes.DATE,
        comment: "time when user can not solve test",
      },
      correctAnswerCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "count of correct answered questions",
      },
      incorrectAnswerCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "count of incorrect answered questions",
      },
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      underscored: true,
      paranoid: true,
    }
  );

  UserResult.associate = function (models) {
    // associations there
    UserResult.belongsTo(models.User, { foreignKey: "userId" });
    UserResult.belongsTo(models.SolvingTest, { foreignKey: "solvingTestId" });
    UserResult.hasMany(models.SolvingQuestion, {
      foreignKey: "userResultId",
    });
  };

  return UserResult;
};

module.exports = { model };
