import { Router } from "express";
import { create, list, remove, getMessages, postMessage } from "../controllers/conversationController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";


const router = Router();
router.use(authMiddleware);

router.post("/create", asyncHandler(create));
router.get("/list", asyncHandler(list));
router.delete("/delete/:id", asyncHandler(remove));
router.get("/get-details/:id/messages", asyncHandler(getMessages));
router.post("/send/:id/messages", asyncHandler(postMessage));

export default router;