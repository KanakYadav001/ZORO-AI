const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const { generateContent, generateVectors } = require("../services/ai.service");
const { Server } = require("socket.io");
const UserModel = require("../models/auth.model");
const MessageModel = require("../models/message.model");
const { upsertVectors, queryVectors } = require("../services/pinecone.service");
const { text } = require("express");

async function InilizedSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173", "https://zoro-ai-0p9n.onrender.com"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const Cookie = cookie.parse(socket.handshake.headers?.cookie || "");

    if (!Cookie.token) {
      return next(new Error("Unauthorized"));
    }

    try {
      const decoded = jwt.verify(Cookie.token, process.env.JWT_TOKEN);
      const user = await UserModel.findById(decoded.id);
      socket.user = user;
      next();
    } catch (error) {
      return next(new Error("Token is invalid"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("A User Connected");

    socket.on("ai-Message", async (userContent) => {
      try {
        const [UserMessage, Uservector] = await Promise.all([
          MessageModel.create({
            user: socket.user._id,
            chat: userContent.chat,
            content: userContent.content,
            role: "user",
          }),
          generateVectors(userContent.content),
        ]);

        await upsertVectors({
          Id: UserMessage._id,
          vectors: Uservector,
          metadata: {
            chatId: userContent.chat,
            text: userContent.content,
          },
        });

        const [MessageHistory, QueueMemory] = await Promise.all([
          MessageModel.find({
            chat: userContent.chat,
          })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean()
            .then((message) => message.reverse()),

          queryVectors({
            vectors: Uservector,
            limit: 5,
            metadata: {},
          }),
        ]);

        const stm = MessageHistory.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        }));

        const ltm = [
          {
            role: "user",
            parts: [
              {
                text: `
            this is the chat history between the user and AI model please use this information to answer the question asked by the user in context of this chat history.
            ${QueueMemory.map((mem) => mem.metadata.text).join("\n")}
            `,
              },
            ],
          },
        ];

        const response = await generateContent([...ltm, ...stm]);

        socket.emit("ai-Response", {
          chat: userContent.chat,
          content: response,
        });

        console.log("AI Response:", response);

        const [ModelMessage, ModelVector] = await Promise.all([
          MessageModel.create({
            user: socket.user._id,
            chat: userContent.chat,
            content: response,
            role: "model",
          }),
          generateVectors(response),
        ]);

        await upsertVectors({
          Id: ModelMessage._id,
          vectors: ModelVector,
          metadata: {
            chatId: userContent.chat,
            text: response,
          },
        });
      } catch (error) {
        console.error("AI Message Error:", error.message);
        socket.emit("ai-Error", {
          chat: userContent.chat,
          error: error.message,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("A User Disconnect");
    });
  });
}

module.exports = InilizedSocket;
