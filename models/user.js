"use strict";

const bcrypt = require("bcryptjs");

const model = (sequelize, DataTypes) => {
  let User = sequelize.define(
    "User",
    {
      firstName: { type: DataTypes.STRING(50), allowNull: false },
      lastName: { type: DataTypes.STRING(50), allowNull: false },
      email: { type: DataTypes.STRING(50), unique: true, allowNull: false },
      username: { type: DataTypes.STRING(50), unique: true, allowNull: false },
      password: { type: DataTypes.STRING, allowNull: false },
      birthDate: { type: DataTypes.DATE, allowNull: false },
      phoneNumber: { type: DataTypes.STRING(25), allowNull: false },
      country: { type: DataTypes.STRING(50), allowNull: true },
      city: { type: DataTypes.STRING, allowNull: true },
      active: { type: DataTypes.BOOLEAN, defaultValue: false },
      image: { type: DataTypes.STRING },
      gender: { type: DataTypes.BOOLEAN },
      job: { type: DataTypes.STRING },
      bio: { type: DataTypes.TEXT },
      status: { type: DataTypes.BOOLEAN, defaultValue: false },
      verifyCode: { type: DataTypes.STRING(100) },
      isAdmin: { type: DataTypes.INTEGER, defaultValue: 0 },
      emailSubscribe: { type: DataTypes.BOOLEAN, defaultValue: false },
      gmt: { type: DataTypes.STRING(10) },
      language: { type: DataTypes.STRING(5) },

      firstNameA: { type: DataTypes.BOOLEAN, defaultValue: true },
      lastNameA: { type: DataTypes.BOOLEAN, defaultValue: true },
      emailA: { type: DataTypes.BOOLEAN, defaultValue: true },
      usernameA: { type: DataTypes.BOOLEAN, defaultValue: true },
      birthDateA: { type: DataTypes.BOOLEAN, defaultValue: false },
      phoneNumberA: { type: DataTypes.BOOLEAN, defaultValue: false },
      countryA: { type: DataTypes.BOOLEAN, defaultValue: true },
      cityA: { type: DataTypes.BOOLEAN, defaultValue: false },
      imageA: { type: DataTypes.BOOLEAN, defaultValue: false },
      genderA: { type: DataTypes.BOOLEAN, defaultValue: false },
      jobA: { type: DataTypes.BOOLEAN, defaultValue: false },
      bioA: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      charset: "utf8",
      collate: "utf8_general_ci",
      underscored: true,
      paranoid: true,
    }
  );

  User.associate = function (models) {
    // associations there
    User.hasMany(models.Payment, { foreignKey: "userId" });
    User.hasMany(models.Test, { foreignKey: "userId" });
    User.hasMany(models.Group, { foreignKey: "userId" });
    User.belongsToMany(models.Group, {
      through: "GroupUser",
      foreignKey: "userId",
    });
    User.belongsToMany(models.Notification, {
      through: { model: "NotificationUser" },
      foreignKey: "userId",
    });
  };

  // Custom methods, recommended by sequelize
  // Comparing user password with given password
  User.prototype.comparePassword = function (pass) {
    return bcrypt.compareSync(password, this.password);
  };
  // hashing password
  User.hashPassword = function (pass) {
    // let's hash password with bcryptjs
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(pass, salt);
    return hash;
  };

  return User;
};

module.exports = { model };
