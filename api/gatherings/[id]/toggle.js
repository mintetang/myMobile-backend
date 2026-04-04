import mongoose from "mongoose";
import Gathering from "../../../models/Gathering.js";

// 🔥 Simple CORS (reliable on Vercel)
function applyCors(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }

  return false;
}

// 🔥 Prevent multiple DB connections
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

export default async function handler(req, res) {
  // ✅ ALWAYS FIRST
  if (applyCors(req, res)) return;

  // ✅ DEBUG (you can remove later)
  console.log("🔥 TOGGLE API HIT:", req.method);

  // ✅ Only allow PUT
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await connectDB();

  const { id } = req.query;

  try {
    const { siblingId, attending } = req.body;

    if (!siblingId) {
      return res.status(400).json({ message: "siblingId is required" });
    }

    const gathering = await Gathering.findById(id);

    if (!gathering) {
      return res.status(404).json({ message: "Gathering not found" });
    }

    if (attending) {
      // ✅ Add if not exists
      if (!gathering.siblings.includes(siblingId)) {
        gathering.siblings.push(siblingId);
      }
    } else {
      // ✅ Remove
      gathering.siblings = gathering.siblings.filter(
        (sid) => sid.toString() !== siblingId
      );
    }

    await gathering.save();

    return res.status(200).json(gathering);

  } catch (err) {
    console.error("❌ TOGGLE ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}