"use strict";

const model = (sequelize, DataTypes) => {
  let Test = sequelize.define(
    "Test",
    {
      name: { type: DataTypes.STRING(200) },
      description: { type: DataTypes.TEXT },
      // createdBy: { type: DataTypes.INTEGER},
      isRandom: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      isAllowed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      image: { type: DataTypes.STRING },
      language: { type: DataTypes.STRING(30) },
      keywords: {
        type: DataTypes.TEXT,
        comment: "Gozleg maksatly",
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
