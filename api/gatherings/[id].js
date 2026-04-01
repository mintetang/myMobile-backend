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

  const { id } = req.query;

  try {
    // ✅ GET one
    if (req.method === "GET") {
      const gathering = await Gathering.findById(id).populate("siblings");

      if (!gathering) {
        return res.status(404).json({ message: "Gathering not found" });
      }

      return res.json(gathering);
    }

    // ✅ UPDATE
    if (req.method === "PUT") {
      const updated = await Gathering.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ message: "Gathering not found" });
      }

      return res.json(updated);
    }

    // ✅ DELETE
    if (req.method === "DELETE") {
      const deleted = await Gathering.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({ message: "Gathering not found" });
      }

      return res.json({ message: "Gathering deleted" });
    }

    return res.status(405).json({ message: "Method not allowed" });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}