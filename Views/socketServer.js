//socket.io app inspiration from Web Dev Simplified: https://www.youtube.com/watch?v=rxzOqP9YwmM

const io = require("socket.io")(9000, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
console.log("running");

//stores usernames
const userNames = {};

//emits messages to clients
io.on("connection", (socket) => {
  socket.on("newChatter", (userName) => {
    userNames[socket.id] = userName;
    socket.broadcast.emit("chatterJoined", userName);
  });
  socket.on("sendMessage", (message) => {
    socket.broadcast.emit("chatMessage", {
      message: message,
      userName: userNames[socket.id],
    });
  });
  socket.on("disconnect", () => {
    socket.broadcast.emit("chatterDisconnected", userNames[socket.id]);
    delete userNames[socket.id];
  });
});
