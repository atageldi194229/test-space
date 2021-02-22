const express = require("express");
const router = express.Router();

const {
  getAll,
  update,
  remove,
  create,
} = require("../../controllers").Admin.BannerController;

const { verify } = require("../../middleware").JwtMiddleware;

router.get("/", verify, getAll);
router.post("/", verify, create);
router.put("/:id", verify, update);
router.delete("/:id", verify, remove);

module.exports = router;
