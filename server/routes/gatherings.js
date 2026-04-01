import express from "express";
import Gathering from "../models/Gathering.js";

const router = express.Router();

// CREATE gathering
router.post("/", async (req, res) => {
  try {
    const gathering = await Gathering.create(req.body);
    res.status(201).json(gathering);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==============================
// GET all gatherings (SORTED)
// ==============================
router.get("/", async (req, res) => {
  try {
    const gatherings = await Gathering.find()
      .sort({ date: 1 }) // 🔥 Oldest → Newest
      .populate("siblings");

    res.json(gatherings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================
// GET gatherings by sibling ID (SORTED)
// ==============================
router.get("/by-sibling/:siblingId", async (req, res) => {
  try {
    const gatherings = await Gathering.find({
      siblings: req.params.siblingId
    })
      .sort({ date: 1 }); // 🔥 Also sorted

    res.json(gatherings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single gathering by ID
router.get("/:id", async (req, res) => {
  try {
    const gathering = await Gathering.findById(req.params.id)
      .populate("siblings");

    if (!gathering) {
      return res.status(404).json({ message: "Gathering not found" });
    }

    res.json(gathering);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE gathering
router.put("/:id", async (req, res) => {
  try {
    const updated = await Gathering.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Gathering not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE gathering
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Gathering.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Gathering not found" });
    }

    res.json({ message: "Gathering deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle sibling attendance
router.put("/:id/toggle", async (req, res) => {
  try {
    const { siblingId, attending } = req.body;

    const gathering = await Gathering.findById(req.params.id);

    if (!gathering) {
      return res.status(404).json({ message: "Gathering not found" });
    }

    if (attending) {
      // add sibling if not already in list
      if (!gathering.siblings.includes(siblingId)) {
        gathering.siblings.push(siblingId);
      }
    } else {
      // remove sibling
      gathering.siblings = gathering.siblings.filter(
        id => id.toString() !== siblingId
      );
    }

    await gathering.save();

    res.json(gathering);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
export default router;