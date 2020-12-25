"use strict";

const model = (sequelize, DataTypes) => {
  let Payment = sequelize.define(
    "Payment",
    {
      tsc: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: "test solving count",
      },
      tcc: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: "test create count",
      },
      tscMoney: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: "money at the start for test solving count",
      },
      tccMoney: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: "money at the start for test create count",
      },
      isTscUnlimited: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isTccUnlimited: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      tscUsed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: "used test solving count",
      },
      tccUsed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: "used test create count",
      },
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "0-waiting, 1-allowed, 2-cancelled",
      },
      allowedAt: {
        type: DataTypes.DATE,
        comment: "allowed time",
      },
      note: {
        type: DataTypes.TEXT,
        defaultValue: "You can write there note. It is great, isn't it",
        comment: "notes",
      },
    },
    {
      charset: "utf8",
      collate: "utf8_general_ci",
      underscored: true,
      paranoid: true,
    }
  );

  Payment.associate = function (models) {
    // associations there

    // whom belongs to this payment
    Payment.belongsTo(models.User, { foreignKey: "userId" });
    Payment.belongsTo(models.User, { foreignKey: "modifiedBy" });

    // which prices uses this payment
    Payment.belongsTo(models.Price, { foreignKey: "tscPriceId" });
    Payment.belongsTo(models.Price, { foreignKey: "tccPriceId" });
  };
  // Custom methods
  Payment.balance = async function (userId) {
    let query = `SELECT
    CASE WHEN SUM(is_tsc_unlimited) >= 1 THEN 'UNLIMITED' ELSE SUM(tsc - tsc_used) END TSC ,
    CASE WHEN SUM(is_tcc_unlimited) >= 1 THEN 'UNLIMITED' ELSE SUM(tcc - tcc_used) END TCC
    FROM \`payments\` WHERE status = 1 and user_id = ${userId} and DATEDIFF(NOW(), allowed_at) <= 30`;

    let res = await sequelize.query(query);
    let data = res[0][0];
    console.log(data);

    return data;
  };

  return Payment;
};

const methods = ({ Payment, GroupUser, Sequelize: { Op } }) => {
  Payment.canSendInvitation = async (userId, { userIds, groupIds }) => {
    // validate data
    userIds = userIds || [];
    groupIds = groupIds || [];
    if (!Array.isArray(userIds) || !Array.isArray(groupIds))
      return next(new ErrorResponse("Validation error"));

    // request db
    let groupUsers = await GroupUser.findAll({
      where: { groupId: groupIds },
      attributes: [`userId`],
    });

    // validate data and add to other users
    userIds = [...userIds, ...groupUsers.map((e) => e.userId)];

    // remove repeating values
    let mp = {};
    for (let i = 0; i < userIds.length; i++) {
      if (!mp[userIds[i]]) mp[userIds[i]] = 1;
      else mp[userIds[i]]++;
    }
    userIds = Object.keys(mp);

    // calculation starts
    let userCount = userIds.length,
      canSend = false,
      dublicatedUsers = userIds.filter((e) => mp[e] > 1).map((e) => Number(e)),
      tsc = {};

    // calculation request db
    let days30 = 30 * 24 * 60 * 60 * 1000;
    let payments = await Payment.findAll({
      where: {
        allowedAt: {
          [Op.gte]: new Date(new Date() - days30),
        },
        status: 1,
        userId,
      },
      // order: [["createdAt", "asc"]],
    });

    for (let i = 0; i < payments.length; i++) {
      if (payments[i].isTscUnlimited === true) canSend = true;
      else userCount -= payments[i].tsc - payments[i].tscUsed;
    }
    if (canSend) tsc.rest = "unlimited";

    tsc.need = userIds.length; // gerekli bolan tsc
    tsc.lack = canSend || userCount < 0 ? 0 : userCount; // yene shuncha tsc gerek
    tsc.rest = tsc.rest || (-userCount < 0 ? 0 : -userCount); // shuncha galar

    if (userCount <= 0) canSend = true;
    // calculation ends

    return {
      canSend,
      dublicatedUsers,
      tsc,

      userId,
      userIds,
      payments,
    };
  };

  Payment.useTsc = async (userId, { tscCount, payments }) => {
    for (let i = 0; i < payments.length; i++) {
      let tsc = payments[i].tsc,
        tscUsed = payments[i].tscUsed,
        isTscUnlimited = payments[i].isTscUnlimited;

      let a = tsc - tscUsed;
      if (isTscUnlimited || tscCount < a) {
        tscUsed += tscCount;
        tscCount = 0;
      } else {
        tscCount -= a;
        tscUsed = tsc;
      }

      await payments[i].update({ tscUsed });

      if (tscCount <= 0) return true;
    }

    return false;
  };

  Payment.canCreateTest = async (userId) => {
    // calculation starts
    let testCount = 1,
      canSend = false,
      tcc = {};

    // calculation request db
    let days30 = 30 * 24 * 60 * 60 * 1000;
    let payments = await Payment.findAll({
      where: {
        allowedAt: {
          [Op.gte]: new Date(new Date() - days30),
        },
        status: 1,
        userId,
      },
      // order: [["createdAt", "asc"]],
    });

    for (let i = 0; i < payments.length; i++) {
      if (payments[i].isTccUnlimited === true) canSend = true;
      else testCount -= payments[i].tcc - payments[i].tccUsed;
    }
    if (canSend) tcc.rest = "unlimited";

    tcc.need = 1; // gerekli bolan tcc
    tcc.lack = canSend || testCount < 0 ? 0 : testCount; // yene shuncha tcc gerek
    tcc.rest = tcc.rest || (-testCount < 0 ? 0 : -testCount); // shuncha galar

    if (testCount <= 0) canSend = true;
    // calculation ends

    return {
      canSend,
      tcc,

      userId,
      payments,
    };
  };

  Payment.useTcc = async (userId, { tccCount, payments }) => {
    for (let i = 0; i < payments.length; i++) {
      let tcc = payments[i].tcc,
        tccUsed = payments[i].tccUsed,
        isTccUnlimited = payments[i].isTccUnlimited;

      let a = tcc - tccUsed;
      if (isTccUnlimited || tccCount < a) {
        tccUsed += tccCount;
        tccCount = 0;
      } else {
        tccCount -= a;
        tccUsed = tcc;
      }

      await payments[i].update({ tccUsed });

      if (tccCount <= 0) return true;
    }

    return false;
  };
};

module.exports = { model, methods };
