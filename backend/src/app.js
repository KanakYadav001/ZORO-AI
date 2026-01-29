const express = require("express");
const app = express();
const coopieParser = require("cookie-parser");
const authRoute = require("./routes/auth.route");
const chatRoute = require("./routes/chat.route");

// CORS configuration
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(coopieParser());
app.use(express.json());

app.use("/auth", authRoute);
app.use("/api", chatRoute);

module.exports = app;
