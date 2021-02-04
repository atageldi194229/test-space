const express = require("express");
const router = express.Router();

const {
  getAll,
  search,
  getOne,
  update,
} = require("../../controllers").Admin.UserController;

const { verify } = require("../../middleware").JwtMiddleware;

router.get("/", verify, getAll);
router.post("/search", verify, search);

router.get("/:id", verify, getOne);
router.put("/:id", verify, update);

module.exports = router;
