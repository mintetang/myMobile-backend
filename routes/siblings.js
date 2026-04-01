import express from "express";
import Sibling from "../models/Sibling.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const siblings = await Sibling.find();
  res.json(siblings);
});

router.post("/", async (req, res) => {
  const sibling = await Sibling.create(req.body);
  if (!req.body.name) {
  return res.status(400).json({ message: "Name required" });
}
  res.json(sibling);
});

router.get("/:id", async (req, res) => {
  try {
    const sibling = await Sibling.findById(req.params.id);
    if (!sibling) {
      return res.status(404).json({ message: "Sibling not found" });
    }
    res.json(sibling);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await Sibling.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Sibling.findByIdAndDelete(req.params.id);
    res.json({ message: "Sibling deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
