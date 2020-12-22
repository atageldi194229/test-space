const express = require("express");
const router = express.Router();

const {
  create,
  update,
  getOne,
} = require("../../controllers").V1.QuestionController;

const { verify } = require("../../middleware").JwtMiddleware;

router.post("/", verify, create);
router.put("/:id", verify, update);
router.get("/:id", verify, getOne);

module.exports = router;
