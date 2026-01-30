import io from "socket.io-client";

const SOCKET_URL = "https://zoro-ai-0p9n.onrender.com";

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (this.socket) return this.socket;

    this.socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      autoConnect: true,
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      console.log("Socket connected successfully");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendAIMessage(content, chatId) {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.socket.off("ai-Response");
        this.socket.off("ai-Error");
        reject(new Error("Response timeout"));
      }, 30000);

      this.socket.once("ai-Response", (response) => {
        clearTimeout(timeoutId);
        this.socket.off("ai-Error");
        resolve(response);
      });

      this.socket.once("ai-Error", (error) => {
        clearTimeout(timeoutId);
        this.socket.off("ai-Response");
        reject(new Error(error.error || "AI service error"));
      });

      this.socket.emit("ai-Message", {
        content,
        chat: chatId,
      });
    });
  }

  onAIResponse(callback) {
    if (!this.socket) return;
    this.socket.on("ai-Response", callback);
  }

  offAIResponse(callback) {
    if (!this.socket) return;
    this.socket.off("ai-Response", callback);
  }
}

export default new SocketService();
