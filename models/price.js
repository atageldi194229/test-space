"use strict";

module.exports = (sequelize, DataTypes) => {
  let Price = sequelize.define(
    "Price",
    {
      type: {
        type: DataTypes.INTEGER,
        comment: "(0-TSC, 1-TCC, 2-TSC_UNLIMITED, 3-TCC-UNLIMITED)",
      },
      data: {
        type: DataTypes.TEXT,
        defaultValue: JSON.stringify([
          {
            ranges: {
              start: 0,
              end: 0,
            },
            price: 0,
          },
        ]),
        allowNull: false,
        comment: "100 tmt DINE SANY, PULUN MUKDARY, SHTUK SANY",
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: "is active or not boolean type by default true",
      },
    },
    {
      charset: "utf8",
      collate: "utf8_general_ci",
      underscored: true,
      paranoid: true,
    }
  );

  Price.associate = function (models) {
    // associations there
    Price.belongsTo(models.User, { foreignKey: "createdBy" });
  };

  return Price;
};
