"use strict";

module.exports = (sequelize, DataTypes) => {
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
