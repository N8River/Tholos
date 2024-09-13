const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }], // Both participants' IDs
  messages: [
    {
      sender: { type: Schema.Types.ObjectId, ref: "User" },
      text: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Conversation", conversationSchema);
