import express from "express";
import Gathering from "../models/Gathering.js";
import Sibling from "../models/Sibling.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const totalGatherings = await Gathering.countDocuments();
    const totalSiblings = await Sibling.countDocuments();

    // 🔥 Populate sibling names directly
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
        : (totalAttendance / totalGatherings).toFixed(2);

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

    // Convert to array + sort + top 5
    const topAttendees = Object.values(siblingAttendance)
      .sort((a, b) => b.attendance - a.attendance)
      .slice(0, 5);

    res.json({
      totalGatherings,
      totalSiblings,
      averageAttendance,
      topAttendees
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// Attendance % Per Gathering
// ==============================
router.get("/attendance-by-gathering", async (req, res) => {
  try {
    const totalSiblings = await Sibling.countDocuments();

    // 🔥 SORT BY DATE ASCENDING HERE
    const gatherings = await Gathering.find().sort({ date: 1 });

    const data = gatherings.map(g => ({
      id: g._id,
      date: g.date, // already sorted
      percentage:
        totalSiblings === 0
          ? 0
          : Number(
              ((g.siblings.length / totalSiblings) * 100).toFixed(1)
            )
    }));

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;