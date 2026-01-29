const jwt = require("jsonwebtoken");
const UserModel = require("../models/auth.model");
const ChatModel = require("../models/chat.model");
const bcrypt = require("bcrypt");

async function Register(req, res) {
  const {
    email,
    fullName: { firstName, lastName },
    password,
  } = req.body;

  const IsUserExist = await UserModel.findOne({ email });
  if (IsUserExist) {
    return res.status(400).json({ message: "User already exists" });
  }
  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await UserModel.create({
    email,
    fullName: { firstName, lastName },
    password: hashPassword,
  });

  // Create default chat for new user
  await ChatModel.create({
    user: newUser._id,
    name: "New Chat",
  });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_TOKEN);

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res
    .status(201)
    .json({ message: "User registered successfully", user: newUser });
}

async function Login(req, res) {
  const { email, password } = req.body;

  const IsUserExist = await UserModel.findOne({ email });
  if (!IsUserExist) {
    return res.status(400).json({ message: "User does not exist" });
  }

  const IspasswordValid = await bcrypt.compare(password, IsUserExist.password);
  if (!IspasswordValid) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ id: IsUserExist._id }, process.env.JWT_TOKEN);
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.status(200).json({ message: "Login successful", user: IsUserExist });
}

module.exports = { Register, Login };
