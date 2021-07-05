const express = require("express");
const router = express.Router();

const {
  getAll,
  getOne,
  search,
  update,
} = require("../../controllers").Admin.TestController;

const { verify } = require("../../middleware").JwtMiddleware;

router.get("/", verify, getAll);
router.get("/:id", verify, getOne);
router.post("/search", verify, search);
router.put("/:id", verify, update);

module.exports = router;
