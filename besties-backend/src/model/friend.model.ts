import mongoose, { Schema, model } from "mongoose";

const friendSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    friend: {
      type: mongoose.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    status: {
      type: String,
      enum: ["requested", "rejected", "accepted"],
      default: "requested",
    },
  },
  { timestamps: true }
);

// Prevent duplicate friend requests between same users
friendSchema.index(
  { user: 1, friend: 1 },
  { unique: true }
);

const FriendModel = model("Friend", friendSchema);
export default FriendModel;
