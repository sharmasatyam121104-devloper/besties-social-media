import mongoose, { Schema, model } from "mongoose";

const chatSchema = new Schema(
  {
    from: {
      type: mongoose.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    to: {
      type: mongoose.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    file: {
        path: {
            type: String,
        },
        type: {
            type: String,
        }
    }
  },
  { timestamps: true }
);



const ChatModel = model("Chat", chatSchema);
export default ChatModel
