import mongoose from "mongoose";

const gatheringSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    siblings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sibling",   // Must match your Sibling model name
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Gathering", gatheringSchema);
