import { Router } from "express";
import { create, list, remove, getMessages, postMessage } from "../controllers/conversationController";
import { authMiddleware } from "../middlewares/authMiddleware";


const router = Router();
router.use(authMiddleware);

router.post("/create", create);
router.get("/list", list);
router.delete("/delete/:id", remove);
router.get("/get-details/:id/messages", getMessages);
router.post("/send/:id/messages", postMessage);

export default router;