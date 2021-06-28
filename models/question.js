"use strict";

const { randomizeArray } = require("../utils");

const model = (sequelize, DataTypes) => {
  let Question = sequelize.define(
    "Question",
    {
      type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment:
          "0-single choise, 1-multi choise, 2-input, 3-true false, 4-matching, 5-blank",
      },
      data: {
        type: DataTypes.TEXT,
        comment: "json data",
      },

      isRandom: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: "places of question answers",
      },

      solveCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "how many times this question is solved",
      },
      correctCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "how many correct answered results",
      },
      incorrectCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "how many incorrect answered results",
      },
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      underscored: true,
      paranoid: true,
    }
  );

  Question.associate = function (models) {
    // associations there

    Question.belongsTo(models.Test, { foreignKey: "testId" });
    Question.hasMany(models.SolvingQuestion, {
      as: "solvingQuestions",
      foreignKey: "questionId",
    });
  };

  return Question;
};

const methods = ({ Question }) => {
  Question.prototype.getPreparedData = function () {
    let data = JSON.parse(this.data);
    delete data.correct;

    if (this.isRandom === true) {
      if ([0, 1].indexOf(this.type) > -1) randomizeArray(data.answers, 10);
      if (this.type === 4) {
        randomizeArray(data.answers.col1, 5);
        randomizeArray(data.answers.col2, 5);
      }
    }

    return data;
  };

  Question.prototype.isAnswerCorrect = function (answer) {
    let isCorrect = false;
    let { correct } = JSON.parse(this.data);

    console.log("=*=*".repeat(6));
    console.log("correct", "answer");
    console.log("=*=*".repeat(6));
    console.log(typeof correct, typeof answer);
    console.log("=*=*".repeat(6));
    console.log(correct, answer);
    console.log("=*=*".repeat(6));

    if (this.type === 1 && correct.length === answer.length) {
      correct.sort((a, b) => a - b);
      answer.sort((a, b) => a - b);
      isCorrect = true;
      for (let i = 0; i < correct.length; i++) {
        if (correct[i] !== answer[i]) {
          isCorrect = false;
          break;
        }
      }
    } else if (
      this.type === 4 &&
      Object.keys(answer).length === Object.keys(correct).length
    ) {
      isCorrect = true;
      for (let i in answer) {
        if (correct[i] !== answer[i]) {
          isCorrect = false;
          break;
        }
      }
    } else if (this.type === 5 && correct.length === answer.length) {
      isCorrect = JSON.stringify(correct) === JSON.stringify(answer);
    } else if ([0, 2, 3].includes(this.type) && answer === correct)
      isCorrect = true;

    return isCorrect;
  };
};

module.exports = { model, methods };
