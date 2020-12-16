"use strict";

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
      editable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment:
          "can be edited or not, biri birinji gezek cozse hemishelik FALSE bolyar",
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

  return Question;
};

module.exports = { model };
