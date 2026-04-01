import { Router } from "express";
import type { SteeringReport } from "../analysis/engine.js";

const router = Router();

type RunStatus = "idle" | "running" | "complete" | "error";

let cachedReport: SteeringReport | null = null;
let runStatus: RunStatus = "idle";
let lastError: string | null = null;

async function startAnalysis() {
  if (runStatus === "running") return;
  runStatus = "running";
  lastError = null;
  try {
    const { runFullAnalysis } = await import("../analysis/engine.js");
    const report = await runFullAnalysis();
    cachedReport = report;
    runStatus = "complete";
    console.log("Analysis complete. Report cached.");
  } catch (err: any) {
    console.error("Analysis error:", err);
    lastError = err?.message ?? "Unknown error";
    runStatus = "error";
  }
}

// Fire-and-forget: returns 202 immediately, analysis runs in background
router.post("/analysis/run", (_req, res) => {
  if (runStatus === "running") {
    return res.status(202).json({ status: "running", message: "Analysis already in progress" });
  }
  // Intentionally not awaited — runs in background
  startAnalysis();
  res.status(202).json({ status: "started" });
});

router.get("/analysis/cached", (_req, res) => {
  res.json({
    hasCache: cachedReport !== null,
    status: runStatus,
    error: lastError,
    report: cachedReport,
  });
});

export default router;
