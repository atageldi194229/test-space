const express = require("express");
const router = express.Router();

const { getAll, search } = require("../../controllers").Admin.UserController;

const { verify } = require("../../middleware").JwtMiddleware;

router.get("/", verify, getAll);
router.post("/search", verify, search);

module.exports = router;
