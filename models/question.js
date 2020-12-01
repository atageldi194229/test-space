"use strict";

module.exports = (sequelize, DataTypes) => {
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
        defaultValue: 0,
        allowNull: false,
        comment: "places of question answers",
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

    Question.belongsTo(models.Test, {
      foreignKey: "testId",
      comment: "test id which belongs this question",
    });
  };

  // Custom methods
  Question.methods = function (models, { sequelize, Sequelize }) {
    return {
      // methods there
    };
  };

  return Question;
};
