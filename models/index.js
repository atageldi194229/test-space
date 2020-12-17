"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
require("dotenv").config({ path: __dirname + "/../config/config.env" });
// const env = process.env.NODE_ENV || "development";
// const config = require(__dirname + "/../config/config.js")[env];
const db = {};
// const config = require("../config/server").DB;

// if (config.use_env_variable) {
//   const sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   const sequelize = new Sequelize(
//     config.database,
//     config.username,
//     config.password,
//     config
//   );
// }

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql" /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
    // logging: false,
  }
);

// new strategy
let modelMethods = [];

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    // const model = sequelize["import"](path.join(__dirname, file));
    const rq = require(path.join(__dirname, file));
    rq.methods && modelMethods.push(rq.methods);
    const model = rq.model(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// new strategy
modelMethods.forEach((e) => e(db));

module.exports = db;
