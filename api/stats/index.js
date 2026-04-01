import mongoose from "mongoose";
import Gathering from "../../models/Gathering.js";
import "../../models/Sibling.js"; // ✅ REQUIRED for populate

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
    // ==============================
    // Basic counts
    // ==============================
    const totalGatherings = await Gathering.countDocuments();
    const totalSiblings = await mongoose.model("Sibling").countDocuments();

    // ==============================
    // Gatherings with populated siblings
    // ==============================
    const gatherings = await Gathering.find()
      .sort({ date: 1 })
      .populate("siblings", "name");

    // ==============================
    // Average Attendance
    // ==============================
    const totalAttendance = gatherings.reduce(
      (sum, g) => sum + g.siblings.length,
      0
    );

    const averageAttendance =
      totalGatherings === 0
        ? 0
        : Number((totalAttendance / totalGatherings).toFixed(2));

    // ==============================
    // Attendance per sibling
    // ==============================
    const siblingAttendance = {};

    gatherings.forEach(g => {
      g.siblings.forEach(sibling => {
        const id = sibling._id.toString();

        if (!siblingAttendance[id]) {
          siblingAttendance[id] = {
            siblingId: id,
            name: sibling.name,
            attendance: 0
          };
        }

        siblingAttendance[id].attendance += 1;
      });
    });

    const topAttendees = Object.values(siblingAttendance)
      .sort((a, b) => b.attendance - a.attendance)
      .slice(0, 5);

    return res.json({
      totalGatherings,
      totalSiblings,
      averageAttendance,
      topAttendees
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}