const express = require("express");
const router = express.Router();

const {
  create,
  update,
  destroy,
  addUser,
  removeUser,
  getAll,
  getOne,
  findGroups,
} = require("../../controllers").V1.GroupController;

const { verify } = require("../../middleware").JwtMiddleware;

router.get("/", verify, getAll);
router.post("/find", verify, findGroups);
router.get("/:id", verify, getOne);
router.post("/", verify, create);
router.post("/:id/user", verify, addUser);
router.put("/:id", verify, update);
router.delete("/:id", verify, destroy);
router.delete("/:id/user", verify, removeUser);

module.exports = router;
