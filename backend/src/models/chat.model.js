const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    name: { type: String, default: "New Chat" },
    content: { type: String, default: "" },
  },
  { timestamps: true },
);

const chatModel = mongoose.model("Chats", ChatSchema);

module.exports = chatModel;
