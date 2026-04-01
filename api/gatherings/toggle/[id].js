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
  res.setHeader("Access-Control-Allow-Methods", "PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  await connectDB();

  const { id } = req.query;

  try {
    const { siblingId, attending } = req.body;

    const gathering = await Gathering.findById(id);

    if (!gathering) {
      return res.status(404).json({ message: "Gathering not found" });
    }

    if (attending) {
      if (!gathering.siblings.includes(siblingId)) {
        gathering.siblings.push(siblingId);
      }
    } else {
      gathering.siblings = gathering.siblings.filter(
        sid => sid.toString() !== siblingId
      );
    }

    await gathering.save();

    return res.json(gathering);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}