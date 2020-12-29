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

const methods = ({ SolvingQuestion }) => {
  SolvingQuestion.upsert = (values, condition) => {
    return SolvingQuestion.findOne({ where: condition }).then(function (obj) {
      // update
      if (obj) return obj.update(values);
      // insert
      return SolvingQuestion.create({ ...values, ...condition });
    });
  };
};

module.exports = { model, methods };
