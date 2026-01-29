const jwt = require("jsonwebtoken");
const UserModel = require("../models/auth.model");

async function AuthMiddleware(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    const user = await UserModel.findById(decoded.id);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is invalid" });
  }
}

module.exports = AuthMiddleware;
