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
      foreignKey: "testId",
    });
  };

  return Test;
};

module.exports = { model };
