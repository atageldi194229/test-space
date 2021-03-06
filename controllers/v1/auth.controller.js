"use strict";

const {
  User,
  Group,
  Payment,
  Attendance,
  sequelize,
  Sequelize: { Op },
} = require("../../models");
const asyncHandler = require("../../middleware/async");
const bcrypt = require("bcryptjs");
const ErrorResponse = require("../../utils/errorResponse");
const { JwtService } = require("../../services");
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
    active: 1,

    verifyCode,
  });

  // add one group for the startter
  await Group.create({
    name: "Group",
    description: "Group description",
    userId: user.id,
  });

  // add free payment
  await Payment.create({
    tcc: 1,
    tsc: 5,
    status: 1,
    allowedAt: new Date(),
    note: "automatic free for register",
    userId: user.id,
  });

  // create token
  let payload = { id: user.id, active: false };
  let token = JwtService.sign(payload);

  // res to the client with token
  res.status(200).json({
    success: true,
    token,
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      image: user.image,
      birthDate: user.birthDate,
      active: user.active,
    },
  });

  // let's send verification code to the mail of user
  // Mailer.sendVerificationCode({
  //   to: email,
  //   verifyCode,
  // });
};

obj.login = async (req, res, next) => {
  const { username, password } = req.body;

  // let's get user by given username
  let user = await User.findOne({
    where: {
      [Op.or]: [{ username }, { email: username }],
    },
    attributes: [
      "id",
      "firstName",
      "lastName",
      "username",
      "image",
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
    let payload = { id: user.id, active: user.active };
    console.log(payload);
    let token = JwtService.sign(payload);

    res.status(200).json({
      success: true,
      token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        image: user.image,
        birthDate: user.birthDate,
        active: user.active,
      },
    });

    // update last log time
    await user.update({ loggedAt: new Date() });

    // note attendance
    await Attendance.note(user.id);
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
  // Mailer.sendVerificationCode({
  //   to: user.email,
  //   verifyCode: user.verifyCode,
  // });

  // res to the client with token
  res.status(200).json({
    success: true,
  });
};

obj.userChecker = async (req, res) => {
  const { username, email, phoneNumber } = req.body;

  let usernameCount = 0,
    emailCount = 0,
    phoneNumberCount = 0;

  if (username)
    usernameCount = await User.count({
      where: { username },
    });

  if (email)
    emailCount = await User.count({
      where: { email },
    });

  if (phoneNumber)
    phoneNumberCount = await User.count({
      where: { phoneNumber },
    });

  res.status(200).json({
    username: !(usernameCount > 0),
    email: !(emailCount > 0),
    phoneNumber: !(phoneNumberCount > 0),
  });
};

/**
 * forget password
 * action - /v1/forget-password
 * method - post
 */
obj.forgetPassword = async (req, res, next) => {
  // client data
  let { email, link } = req.body;

  // validate
  if (link.length > 80) return next(new ErrorResponse("Validation error"));

  let user = await User.findOne({
    where: { email },
    attributes: ["verifyCode", "email"],
  });

  // let's send verification code to the mail of user
  // await Mailer.sendForgetPasswordMessage({
  //   to: user.email,
  //   verifyCode: user.verifyCode,
  //   link,
  // });

  res.status(200).json({
    success: true,
  });
};

/**
 * update password by verification code
 * action - /v1/change-password
 * method - post
 */
obj.changePassword = async (req, res, next) => {
  // client data
  let { verifyCode, password } = req.body;

  // request db
  let updatedRows = await User.update(
    { password: User.hashPassword(password) },
    {
      where: { verifyCode },
    }
  );

  // error test
  if (!updatedRows)
    return next(new ErrorResponse("Invalid verification code", 12));

  // client response
  res.status(200).json({
    success: true,
  });
};

// When exporting all collected data
let keys = Object.keys(obj);
// exclude some functions
let excluded_keys = [];
for (let i = 0; i < keys.length; i++)
  if (!excluded_keys.includes(keys[i]))
    obj[keys[i]] = asyncHandler(obj[keys[i]]);
// exporting all functions
module.exports = obj;
