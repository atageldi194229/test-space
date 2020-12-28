const express = require("express");
const router = express.Router();

const {
  create,
  getAll,
  getOne,
  update,
} = require("../../controllers").V1.TestController;

const { verify } = require("../../middleware").JwtMiddleware;

router.get("/", getAll);
router.post("/", verify, create);
router.get("/:id", verify, getOne);
router.put("/:id", verify, update);

module.exports = router;
