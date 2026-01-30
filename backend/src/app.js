const express = require("express");
const app = express();
const coopieParser = require("cookie-parser");
const authRoute = require("./routes/auth.route");
const chatRoute = require("./routes/chat.route");
const path = require("path");
// CORS configuration
const cors = require("cors");
app.use(
  cors({
    origin: ["http://localhost:5173", "https://zoro-ai-0p9n.onrender.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(coopieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/auth", authRoute);
app.use("/api", chatRoute);
app.get("*name", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

module.exports = app;
