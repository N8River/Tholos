require("dotenv").config({ path: "../.env" });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const app = express();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");
const conversationRoutes = require("./routes/conversation");
const messageRoutes = require("./routes/message");
const notificationRoutes = require("./routes/notification");
const searchRoutes = require("./routes/search");

const Message = require("./model/message");
const Conversation = require("./model/conversation");
const Notification = require("./model/notification");
const User = require("./model/user");

if (process.env.NODE_ENV === "production") {
  console.log = () => {}; // Disable all logs in production
  console.error = () => {}; // Optional: Disable error logs too
}

const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW
    ? parseInt(process.env.RATE_LIMIT_WINDOW)
    : 15 * 60 * 1000, // Default: 15 minutes
  max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 100, // Default: 100 requests per window
  message: "Too many requests, please try again later.",
});

app.use(limiter);
app.use(helmet());

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
app.use("/api/search", searchRoutes);

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
    // 1. Save the new message
    const message = new Message({
      conversationId,
      sender: senderId,
      text,
    });
    const savedMessage = await message.save();

    // 2. Populate the sender field, so we get userName and avatar
    await savedMessage.populate("sender", "userName avatar");

    // 3. Emit the *fully populated* message, including createdAt
    io.to(conversationId).emit("message", {
      _id: savedMessage._id,
      conversationId: savedMessage.conversationId,
      createdAt: savedMessage.createdAt, // fix "Invalid Date"
      text: savedMessage.text,
      read: savedMessage.read,
      sender: {
        _id: savedMessage.sender._id,
        userName: savedMessage.sender.userName,
        avatar: savedMessage.sender.avatar,
      },
    });

    // 4. Notification logic (unchanged)
    const userSender = await User.findOne({ _id: senderId });
    const conversation = await Conversation.findById(conversationId);
    const otherParticipant = conversation.participants.find(
      (p) => p.toString() !== senderId
    );

    const notification = new Notification({
      user: otherParticipant,
      type: "message",
      sender: userSender,
      conversation: conversation,
      message: `sent you a message`,
    });
    await notification.save();
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
    socket.to(conversationId).volatile.emit("typing", { senderId });
  });

  // Handle stop typing event
  socket.on("stopTyping", ({ conversationId, senderId }) => {
    socket.to(conversationId).volatile.emit("stopTyping", { senderId });
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
