require("dotenv").config({ path: "../.env" });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");
const conversationRoutes = require("./routes/conversation");
const messageRoutes = require("./routes/message");
const notificationRoutes = require("./routes/notification");

const Message = require("./model/message");
const Conversation = require("./model/conversation");
const Notification = require("./model/notification");
const User = require("./model/user");

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/notification", notificationRoutes);

app.get("/", (req, res, next) => {
  res.send("Hello World! ~ Tholos");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // Allow frontend connection
    methods: ["GET", "POST"],
  },
});

app.locals.io = io;

io.on("connection", (socket) => {
  console.log("A user connected");

  const { userId } = socket.handshake.query;
  // console.log("UserID:", userId);
  socket.join(userId);

  socket.on("joinRoom", async ({ conversationId }) => {
    socket.join(conversationId);
    console.log(`User joined conversation: ${conversationId}`);
  });

  socket.on("sendMessage", async ({ conversationId, senderId, text }) => {
    const userSender = await User.findOne({ _id: senderId });
    // Save message to database
    const message = new Message({
      conversationId,
      sender: senderId,
      text,
    });

    await message.save();

    // Find the conversation participants
    const conversation = await Conversation.findById(conversationId);
    const otherParticipant = conversation.participants.find(
      (p) => p.toString() !== senderId
    );

    // Emit the message to the room (conversation)
    io.to(conversationId).emit("message", {
      conversationId,
      sender: senderId,
      text,
    });

    // Create and save a notification for the other user
    const notification = new Notification({
      user: otherParticipant,
      type: "message",
      sender: userSender,
      conversation: conversation,
      message: `You have a new message from ${userSender.userName}`,
    });
    await notification.save();

    // Emit notification event to the other user
    io.to(otherParticipant.toString()).emit("notification", notification);
  });

  // Handle message read event
  socket.on("messageRead", async ({ conversationId, userId }) => {
    try {
      // Update the messages to mark them as read
      await Message.updateMany(
        { conversationId, sender: { $ne: userId }, read: false },
        { $set: { read: true } }
      );
      console.log(`Messages in conversation ${conversationId} marked as read`);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  // Handle typing event
  socket.on("typing", ({ conversationId, senderId }) => {
    socket.to(conversationId).emit("typing", { senderId });
  });

  // Handle stop typing event
  socket.on("stopTyping", ({ conversationId, senderId }) => {
    socket.to(conversationId).emit("stopTyping", { senderId });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log("Error connecting to MongoDB:", err));
