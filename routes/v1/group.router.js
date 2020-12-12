const express = require("express");
const router = express.Router();

const {
  create,
  update,
  destroy,
  addUser,
  removeUser,
} = require("../../controllers").V1.GroupController;

const { verify } = require("../../middleware").JwtMiddleware;

router.post("/", verify, create);
router.put("/:id", verify, update);
router.delete("/:id", verify, destroy);
router.post("/:id/user", verify, addUser);
router.delete("/:id/user", verify, removeUser);

module.exports = router;
