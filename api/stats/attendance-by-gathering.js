import mongoose from "mongoose";
import Gathering from "../../models/Gathering.js";
import Sibling from "../../models/Sibling.js";

import { applyCors } from "../../lib/cors.js";

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  await connectDB();

  try {
    const totalSiblings = await Sibling.countDocuments();

    const gatherings = await Gathering.find().sort({ date: 1 });

    const data = gatherings.map(g => ({
      id: g._id,
      date: g.date,
      percentage:
        totalSiblings === 0
          ? 0
          : Number(
              ((g.siblings.length / totalSiblings) * 100).toFixed(1)
            )
    }));

    return res.json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}