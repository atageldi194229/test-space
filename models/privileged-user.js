"use strict";

const bcrypt = require("bcryptjs");

const model = (sequelize, DataTypes) => {
  let PrivilegedUser = sequelize.define(
    "PrivilegedUser",
    {
      username: { type: DataTypes.STRING(50), unique: true, allowNull: false },
      password: { type: DataTypes.STRING, allowNull: false },
      // firstName: { type: DataTypes.STRING(50), allowNull: false },
      // lastName: { type: DataTypes.STRING(50), allowNull: false },
      // email: { type: DataTypes.STRING(50), unique: true, allowNull: false },
      // birthDate: { type: DataTypes.DATE, allowNull: false },
      // phoneNumber: { type: DataTypes.STRING(25), allowNull: false },
      role: {
        type: DataTypes.CHAR,
        defaultValue: "m",
        allowNull: false,
        comment: "'a' - adminstrator, 'm'-moderator",
      },
    },
    {
      charset: "utf8",
      collate: "utf8_general_ci",
      underscored: true,
      paranoid: true,
    }
  );

  PrivilegedUser.associate = function (models) {
    // associations there
    PrivilegedUser.hasMany(models.Payment, {
      as: "modifiedPayments",
      foreignKey: "modifiedBy",
    });
  };

  return PrivilegedUser;
};

const methods = ({ PrivilegedUser }) => {
  // Comparing user password with given password
  PrivilegedUser.prototype.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  };
  // hashing password
  PrivilegedUser.hashPassword = function (pass) {
    // let's hash password with bcryptjs
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(pass, salt);
    return hash;
  };
};

module.exports = { model, methods };
