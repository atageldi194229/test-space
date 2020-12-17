const express = require("express");
const router = express.Router();

const {
  sendInvitation,
  setRead,
  getUnread,
  getAll,
  destroy,
} = require("../../controllers").V1.NotificationController;

const { verify } = require("../../middleware").JwtMiddleware;

router.post("/send-invitation", verify, sendInvitation);
router.get("/unread", verify, getUnread);
router.get("/", verify, getAll);
router.delete("/:id", verify, destroy);
router.post("/:id/read", verify, setRead);

module.exports = router;
