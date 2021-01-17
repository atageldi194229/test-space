const express = require("express");
const router = express.Router();

const {
  getAll,
  search,
  update,
} = require("../../controllers").Admin.TestController;

const { verify } = require("../../middleware").JwtMiddleware;

router.get("/", verify, getAll);
router.post("/search", verify, search);
router.put("/:id", verify, update);

module.exports = router;
