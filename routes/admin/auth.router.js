const express = require("express");
const router = express.Router();

const { register, login } = require("../../controllers").Admin.AuthController;

const { verify, hasRole } = require("../../middleware").JwtMiddleware;

router.post("/register", verify, hasRole("a"), register);
router.post("/login", login);

module.exports = router;
