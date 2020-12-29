const express = require("express");
const router = express.Router();

const {
  findUsers,
  getMyAccount,
  updateMyAccount,
  getOne,
} = require("../../controllers").V1.UserController;

// const { getUser } = require("../../middleware").JwtMiddleware;

router.post("/find", findUsers);
router.get("/my/account", getMyAccount);
router.post("/my/account", updateMyAccount);
router.get("/:id", getOne);

module.exports = router;
