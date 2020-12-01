"use strict";

module.exports = (sequelize, DataTypes) => {
  let Other = sequelize.define(
    "Other",
    {
      key: {
        type: DataTypes.STRING,
      },
      value: {
        type: DataTypes.TEXT,
      },
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      underscored: true,
      paranoid: true,
    }
  );

  Other.associate = function (models) {
    // associations there

    Other.belongsTo(models.Test, {
      foreignKey: "testId",
      comment: "test id which belongs this Other",
    });
  };

  // Custom methods
  Other.methods = function (models, { sequelize, Sequelize }) {
    return {
      // methods there
    };
  };

  return Other;
};
