const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Link to the user who created the post
  content: { type: String, required: true },
  image: { type: String },
  video: { type: String },
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }], // Array of user IDs who habe liked the post
  comments: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // user who commented
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // views: { type: Number, default: 0 }, // Count of views (will add later)
});

module.exports = mongoose.model("Post", postSchema);
