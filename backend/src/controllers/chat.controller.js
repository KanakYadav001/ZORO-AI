const ChatModel = require("../models/chat.model");
const MessageModel = require("../models/message.model");

async function createChat(req, res) {
  try {
    const { name } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const chat = await ChatModel.create({
      user: user._id,
      name: name || "New Chat",
      content: "",
    });

    res.status(201).json({ message: "Chat created successfully", chat });
  } catch (error) {
    console.error("Error creating chat:", error);
    res
      .status(500)
      .json({ message: "Error creating chat", error: error.message });
  }
}

async function getChats(req, res) {
  try {
    const user = req.user;

    const chats = await ChatModel.find({ user: user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ chats });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching chats", error: error.message });
  }
}

async function getMessages(req, res) {
  try {
    const { chatId } = req.params;
    const user = req.user;

    // Verify user owns the chat
    const chat = await ChatModel.findById(chatId);
    if (!chat || chat.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const messages = await MessageModel.find({ chat: chatId })
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({ messages });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching messages", error: error.message });
  }
}

async function Chat(req, res) {
  try {
    const { content, chatId } = req.body;
    const user = req.user;

    // Verify user owns the chat if chatId provided
    if (chatId) {
      const chat = await ChatModel.findById(chatId);
      if (!chat || chat.user.toString() !== user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }
    }

    const chat = await ChatModel.create({
      user: user._id,
      content: content,
    });

    res
      .status(201)
      .json({ message: "Chat message created successfully", chat });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating chat", error: error.message });
  }
}

module.exports = { Chat, createChat, getChats, getMessages };
