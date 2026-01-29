require("dotenv").config();
const mongoose = require("mongoose");
const ChatModel = require("./src/models/chat.model");
const UserModel = require("./src/models/auth.model");

async function cleanup() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to MongoDB");

    // Get all users
    const users = await UserModel.find();
    console.log(`\nFound ${users.length} users\n`);

    // For each user, keep only the most recent chat
    for (const user of users) {
      const userChats = await ChatModel.find({ user: user._id }).sort({
        createdAt: -1,
      });
      console.log(`User: ${user.email} - has ${userChats.length} chats`);

      // If more than 1 chat, delete all but the newest one
      if (userChats.length > 1) {
        const chatsToDelete = userChats.slice(1); // Keep first (newest), delete rest
        const deleteIds = chatsToDelete.map((c) => c._id);

        const result = await ChatModel.deleteMany({
          _id: { $in: deleteIds },
        });
        console.log(`  - Deleted ${result.deletedCount} old chats`);
      } else {
        console.log(`  - Already has only 1 chat (good!)`);
      }
    }

    console.log("\nCleanup complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

cleanup();
