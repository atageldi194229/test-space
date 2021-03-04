"use strict";

const model = (sequelize, DataTypes) => {
  let Attendance = sequelize.define(
    "Attendance",
    {
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
    },
    {
      charset: "utf8",
      collate: "utf8_general_ci",
      underscored: true,
      timestamps: false,
    }
  );

  Attendance.associate = function (models) {
    // associations there

    Attendance.belongsTo(models.User, { as: "user", foreignKey: "userId" });
  };

  return Attendance;
};

const methods = ({ Attendance, Sequelize: { Op } }) => {
  Attendance.note = async function (userId) {
    const TODAY = new Date(new Date().setHours(0, 0, 0, 0));

    let attendance = await Attendance.findOne({
      where: {
        userId,
        [Op.and]: [
          {
            createdAt: {
              [Op.gte]: new Date(TODAY.getTime() - 24 * 60 * 60 * 1000),
            },
          },
          {
            createdAt: {
              [Op.lte]: TODAY,
            },
          },
        ],
      },
    });

    if (!attendance) await Attendance.create({ userId });
  };
};

module.exports = { model, methods };
