const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // The user receiving the notification
  type: { type: String, required: true }, // e.g., 'message', 'like', 'comment'
  message: { type: String },
  post: { type: Schema.Types.ObjectId, ref: "Post" },
  sender: { type: Schema.Types.ObjectId, ref: "User" }, // The user who performed the action (e.g., like, follow)
  conversation: { type: Schema.Types.ObjectId, ref: "Conversation" }, // For messages
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);
