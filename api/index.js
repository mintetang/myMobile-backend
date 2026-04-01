import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

import gatheringRoutes from "../routes/gatherings.js";
import siblingRoutes from "../routes/siblings.js";
import statsRouter from "../routes/stats.js";

dotenv.config({ path: "./.env" });

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// Debug (optional)
console.log("MONGO_URI:", process.env.MONGO_URI);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/siblings", siblingRoutes);
app.use("/api/gatherings", gatheringRoutes);
app.use("/api/stats", statsRouter);

const PORT = 5000;

// ✅ Start only after DB connects
mongoose
  .connect(process.env.MONGO_URI, {
  family: 4, // 👈 ADD THIS
})
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

export default app;