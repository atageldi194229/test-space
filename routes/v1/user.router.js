const express = require("express");
const router = express.Router();

const {
  findUsers,
  getMyAccount,
  updateMyAccount,
  updateMyAccountImage,
  getOne,
} = require("../../controllers").V1.UserController;

// const { getUser } = require("../../middleware").JwtMiddleware;

router.post("/find", findUsers);
router.get("/my/account", getMyAccount);
router.post("/my/account", updateMyAccount);
router.post("/my/account/image", updateMyAccountImage);
router.get("/:id", getOne);

module.exports = router;
