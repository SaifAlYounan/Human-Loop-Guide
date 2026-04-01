import { Router } from "express";
import type { SteeringReport } from "../analysis/engine.js";

const router = Router();

let cachedReport: SteeringReport | null = null;
let isRunning = false;

router.post("/analysis/run", async (_req, res) => {
  if (isRunning) {
    return res.status(409).json({ error: "Analysis already in progress" });
  }

  try {
    isRunning = true;
    const { runFullAnalysis } = await import("../analysis/engine.js");
    const report = await runFullAnalysis();
    cachedReport = report;
    res.json(report);
  } catch (err) {
    console.error("Analysis error:", err);
    res.status(500).json({ error: "Analysis failed. Check server logs." });
  } finally {
    isRunning = false;
  }
});

router.get("/analysis/cached", (_req, res) => {
  res.json({ hasCache: cachedReport !== null, report: cachedReport });
});

export default router;
