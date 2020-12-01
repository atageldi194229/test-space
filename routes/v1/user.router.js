const express = require("express");
const router = express.Router();

const { findUsers } = require("../../controllers").V1.UserController;

// const { getUser } = require("../../middleware").JwtMiddleware;

router.post("/find-users", findUsers);

module.exports = router;
