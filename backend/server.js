require("dotenv").config();
const connectDB = require("./src/db/db");
const InilizedSocket = require("./src/socket/socket.server");

connectDB();
const app = require("./src/app");
const http = require("http").createServer(app);

InilizedSocket(http);

http.listen(3000, () => {
  console.log("Server is running on port 3000");
});
