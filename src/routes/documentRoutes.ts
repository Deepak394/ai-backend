import { Router } from "express";
import { create, list, getOne, remove, update } from "../controllers/documentController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authMiddleware); 

router.post("/create-document", asyncHandler(create));
router.get("/list-documents", asyncHandler(list));
router.get("/get-document/:id", asyncHandler(getOne));
router.delete("/delete-document/:id", asyncHandler(remove));
router.put("/update-document/:id", asyncHandler(update));

export default router;