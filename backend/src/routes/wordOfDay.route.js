import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getTodayWord, submitSentence, getEnglishWordOfDay } from "../controllers/wordOfDay.controller.js";

const router = express.Router();

router.get("/today", protectRoute, getTodayWord);
router.get("/english", protectRoute, getEnglishWordOfDay);
router.post("/submit", protectRoute, submitSentence);

export default router;
