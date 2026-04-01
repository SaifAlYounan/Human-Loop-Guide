import { Router } from "express";
import { documents, getDocumentById, getDocumentSummaries } from "../data/documents.js";

const router = Router();

router.get("/documents", (_req, res) => {
  res.json(getDocumentSummaries());
});

router.get("/documents/:id", (req, res) => {
  const doc = getDocumentById(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: "Document not found" });
  }
  res.json(doc);
});

export default router;
