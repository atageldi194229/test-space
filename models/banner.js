"use strict";

const model = (sequelize, DataTypes) => {
  let Banner = sequelize.define(
    "Banner",
    {
      image: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "image path",
      },
      keywords: {
        type: DataTypes.STRING,
        defaultValue: " ",
        comment: "tertipleshdirmek uchin sozler",
      },
      payload: {
        type: DataTypes.TEXT,
        defaultValue: "{}",
        allowNull: false,
        comment: "json object with info",
      },
      startTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
        comment: "gorkezip bashlayan wagty",
      },
      endTime: {
        type: DataTypes.DATE,
        comment: "gorkezip gutaryan wagty",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      charset: "utf8",
      collate: "utf8_general_ci",
      underscored: true,
      timestamps: true,
    }
  );

  Banner.associate = function (models) {
    // associations there
  };

  return Banner;
};

module.exports = { model };
