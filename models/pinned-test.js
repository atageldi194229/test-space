"use strict";

const model = (sequelize, DataTypes) => {
  let PinnedTest = sequelize.define(
    "PinnedTest",
    {},
    {
      charset: "utf8",
      collate: "utf8_general_ci",
      underscored: true,
      timestamps: false,
    }
  );

  return PinnedTest;
};

module.exports = { model };
