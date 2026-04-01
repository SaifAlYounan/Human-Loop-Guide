import { Router } from "express";
import { checklist } from "../data/checklist.js";

const router = Router();

router.get("/checklist", (_req, res) => {
  res.json(checklist);
});

export default router;
