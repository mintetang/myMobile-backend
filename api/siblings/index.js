import { applyCors } from "../../lib/cors.js";
import mongoose from "mongoose";
import Sibling from "../../models/Sibling.js";

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
    // ✅ GET /api/siblings
    if (req.method === "GET") {
      const siblings = await Sibling.find();
      return res.status(200).json(siblings);
    }

    // ✅ POST /api/siblings
    if (req.method === "POST") {
      if (!req.body.name) {
        return res.status(400).json({ message: "Name required" });
      }

      const sibling = await Sibling.create(req.body);
      return res.status(201).json(sibling);
    }

    return res.status(405).json({ message: "Method not allowed" });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}