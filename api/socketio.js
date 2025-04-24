import { Server } from "socket.io";

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log("Setting up socket.io server...");
    const io = new Server(res.socket.server, {
      path: "/api/socketio",
      addTrailingSlash: false,
      // You can configure other options here as needed
    });

    io.on("connection", (socket) => {
      console.log("a user connected (serverless)");
      socket.on("chat message", (msg) => {
        io.emit("chat message", msg);
      });
      socket.on("disconnect", () => {
        console.log("user disconnected (serverless)");
      });
    });

    res.socket.server.io = io;
  } else {
    console.log("socket.io server already running");
  }
  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default ioHandler;