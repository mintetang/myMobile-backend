import mongoose from "mongoose";
import Sibling from "../../models/Sibling.js";

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

export default async function handler(req, res) {
    // ✅ CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  await connectDB();

  const { id } = req.query;

  try {
    // ✅ GET /api/siblings/:id
    if (req.method === "GET") {
      const sibling = await Sibling.findById(id);

      if (!sibling) {
        return res.status(404).json({ message: "Sibling not found" });
      }

      return res.json(sibling);
    }

    // ✅ PUT /api/siblings/:id
    if (req.method === "PUT") {
      const updated = await Sibling.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      );

      return res.json(updated);
    }

    // ✅ DELETE /api/siblings/:id
    if (req.method === "DELETE") {
      await Sibling.findByIdAndDelete(id);
      return res.json({ message: "Sibling deleted" });
    }

    return res.status(405).json({ message: "Method not allowed" });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}