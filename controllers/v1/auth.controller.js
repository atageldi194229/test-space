"use strict";

const {
  User,
  Group,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const bcrypt = require("bcryptjs");
const ErrorResponse = require("../../utils/errorResponse");
const { JwtService, Mailer } = require("../../services");
const { v4: uuidv4 } = require("uuid");
const obj = {};

obj.register = async (req, res) => {
  let {
    firstName,
    lastName,
    email,
    username,
    phoneNumber,
    birthDate,
    password,

    lang,
  } = req.body;

  // let's hash password with bcryptjs
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  // create verify code
  const verifyCode = uuidv4();

  // save in the db
  let user = await User.create({
    firstName,
    lastName,
    email,
    username,
    phoneNumber,
    birthDate,
    password: hash,

    verifyCode,
  });

  // add one group for the startter
  await Group.create({
    name: "Group",
    description: "Group description",
    userId: user.id,
  });

  // create token
  let payload = { id: user.id };
  console.log(payload);
  let token = JwtService.sign(payload);

  // res to the client with token
  res.status(200).json({
    success: true,
    token,
  });

  // let's send verification code to the mail of user
  Mailer.sendVerificationCode({
    to: email,
    verifyCode,
  });
};

obj.login = async (req, res, next) => {
  const { username, password } = req.body;

  // let's get user by given username
  let user = await User.findOne({
    where: {
      [Op.or]: [{ username }, { email: username }],
    },
    attributes: [
      "firstName",
      "lastName",
      "username",
      "birthDate",
      "password",
      "active",
    ],
  });

  // user validation
  if (!user) return next(new ErrorResponse("User not found"));

  let resCompare = bcrypt.compareSync(password, user.password);

  if (resCompare) {
    // create token
    let payload = { id: user.id };
    console.log(payload);
    let token = JwtService.sign(payload);

    res.status(200).json({
      success: true,
      token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        birthDate: user.birthDate,
        active: user.active,
      },
    });
  } else {
    res.status(404).json({
      success: false,
      msg: "Username or Password is invalid",
    });
  }
};

obj.verification = async (req, res) => {
  const { code } = req.params;

  let updatedRowCount = await User.update(
    { active: true },
    { where: { verifyCode: code } }
  );

  if (Array.isArray(updatedRowCount) && updatedRowCount.length > 0) {
    updatedRowCount = updatedRowCount[0];
  }

  console.log(updatedRowCount, "*".repeat(10));

  if (updatedRowCount === 0) {
    // send to the 404
    return res.send("/404");
  }

  res.send("/main");
};

obj.resendVerificationCode = async (req, res) => {
  let user = await User.findOne({
    where: { id: req.user.id },
    attributes: ["email", "verifyCode"],
  });

  // let's send verification code to the mail of user
  Mailer.sendVerificationCode({
    to: user.email,
    verifyCode: user.verifyCode,
  });

  // res to the client with token
  res.status(200).json({
    success: true,
  });
};

obj.userChecker = async (req, res) => {
  const { username, email } = req.body;

  let usernameCount = 0,
    emailCount = 0;

  if (username)
    usernameCount = await User.count({
      where: { username },
    });

  if (email)
    emailCount = await User.count({
      where: { email },
    });

  res.status(200).json({
    username: !(usernameCount > 0),
    email: !(emailCount > 0),
  });
};

/**
 * used getUser middleware
 */
obj.forgetPassword = async (req, res) => {
  // get user id
  let { id } = req.user;

  let randStr = uuidv4().substr(-9);

  res.status(200).json({
    success: true,
  });
};

// When exporting all collected data
let keys = Object.keys(obj);
// exclude some functions
let excluded_keys = ["status"];
for (let i = 0; i < keys.length; i++)
  if (!excluded_keys.includes(keys[i]))
    obj[keys[i]] = asyncHandler(obj[keys[i]]);
// exporting all functions
module.exports = obj;
