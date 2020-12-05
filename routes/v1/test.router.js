const express = require("express");
const router = express.Router();

const {
  create,
  getAll,
  getOne,
} = require("../../controllers").V1.TestController;

const { getUser } = require("../../middleware").JwtMiddleware;

router.get("/", getAll);
router.post("/", getUser, create);
router.get("/:id", getUser, getOne);

module.exports = router;
