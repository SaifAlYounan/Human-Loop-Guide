import { Router, type IRouter } from "express";
import healthRouter from "./health";
import documentsRouter from "./documents";
import checklistRouter from "./checklist";
import analysisRouter from "./analysis";

const router: IRouter = Router();

router.use(healthRouter);
router.use(documentsRouter);
router.use(checklistRouter);
router.use(analysisRouter);

export default router;
