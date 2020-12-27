"use strict";

const model = (sequelize, DataTypes) => {
  let SolvingQuestion = sequelize.define(
    "SolvingQuestion",
    {
      answer: {
        type: DataTypes.TEXT,
        comment: "answer of user",
      },
      isCorrect: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: "answer of question correct or not",
      },
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      underscored: true,
      paranoid: true,
    }
  );

  SolvingQuestion.associate = function (models) {
    // associations there
    SolvingQuestion.belongsTo(models.Question, { foreignKey: "questionId" });
    SolvingQuestion.belongsTo(models.UserResult, {
      foreignKey: "userResultId",
    });
  };

  return SolvingQuestion;
};

module.exports = { model };
