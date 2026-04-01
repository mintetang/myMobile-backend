import mongoose from "mongoose";

const SiblingSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// 👇 THIS IS THE IMPORTANT PART
SiblingSchema.virtual("gatherings", {
  ref: "Gathering",
  localField: "_id",
  foreignField: "siblings",
});

export default mongoose.model("Sibling", SiblingSchema);