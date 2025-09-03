import express from "express";
import {protectRoute} from "../middleware/auth.middleware.js";
import {getStreamToken, getChatUsers, canMessage} from "../controllers/chat.controller.js";

const router= express.Router();

router.use(protectRoute);

router.get("/token", getStreamToken);
router.get("/users", getChatUsers);
router.get("/can-message/:recipientId", canMessage);

export default router;