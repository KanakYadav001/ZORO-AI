const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../middleware/auth.middleware");
const {
  Chat,
  createChat,
  getChats,
  getMessages,
} = require("../controllers/chat.controller");

router.post("/chat", AuthMiddleware, Chat);
router.post("/chats", AuthMiddleware, createChat);
router.get("/chats", AuthMiddleware, getChats);
router.get("/chats/:chatId/messages", AuthMiddleware, getMessages);

module.exports = router;
