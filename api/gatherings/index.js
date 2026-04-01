import { applyCors } from "../../lib/cors.js";
import mongoose from "mongoose";
import Gathering from "../../models/Gathering.js";

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

export default async function handler(req, res) {
  // ✅ APPLY CORS FIRST
  if (applyCors(req, res)) return;

  await connectDB();

  try {
    if (req.method === "GET") {
      const gatherings = await Gathering.find()
        .sort({ date: 1 })
        .populate("siblings");

      return res.json(gatherings);
    }

    if (req.method === "POST") {
      const gathering = await Gathering.create(req.body);
      return res.status(201).json(gathering);
    }

    return res.status(405).json({ message: "Method not allowed" });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}