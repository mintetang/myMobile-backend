import mongoose from "mongoose";
import Gathering from "../../../models/Gathering.js";

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  await connectDB();

  const { siblingId } = req.query;

  try {
    const gatherings = await Gathering.find({
      siblings: siblingId
    }).sort({ date: 1 });

    return res.json(gatherings);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}