"use strict";

const model = (sequelize, DataTypes) => {
  let Message = sequelize.define(
    "Message",
    {
      name: { type: DataTypes.STRING(50) },
      email: { type: DataTypes.STRING(50) },
      text: { type: DataTypes.TEXT },
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "0 - waiting, 1 - served, 2 - denied",
      },
      note: { type: DataTypes.TEXT, comment: "notes for moderators" },
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      underscored: true,
      paranoid: true,
    }
  );

  Message.associate = function (models) {
    // associations there

    Message.belongsTo(models.PrivilegedUser, { foreignKey: "updatedBy" });
  };

  return Message;
};

module.exports = { model };
