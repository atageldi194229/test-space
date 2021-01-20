const express = require("express");
const router = express.Router();

const {
  findUsers,
  getMyAccount,
  getMyBalance,
  updateMyAccount,
  updateMyAccountImage,
  getOne,
} = require("../../controllers").V1.UserController;

const { verify } = require("../../middleware").JwtMiddleware;

router.post("/find", findUsers);
router.get("/my/account", verify, getMyAccount);
router.get("/my/balance", verify, getMyBalance);
router.put("/my/account", verify, updateMyAccount);
router.put("/my/account/image", verify, updateMyAccountImage);
router.get("/:id", getOne);

module.exports = router;
