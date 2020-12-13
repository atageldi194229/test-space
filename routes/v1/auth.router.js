const express = require("express");
const router = express.Router();

const {
  register,
  login,
  verification,
  resendVerificationCode,
  userChecker,
} = require("../../controllers").V1.AuthController;

const { verify } = require("../../middleware").JwtMiddleware;

router.post("/register", register);
router.post("/login", login);
router.get("/verify-code/:code", verification);
router.get("/resend-verify-code", verify, resendVerificationCode);
router.post("/user-checker", userChecker);

module.exports = router;
