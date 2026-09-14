import { Router } from "express";
import { create, list, getOne, remove, update } from "../controllers/documentController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware); 

router.post("/create-document", create);
router.get("/list-documents", list);
router.get("/get-document/:id", getOne);
router.delete("/delete-document/:id", remove);
router.put("/update-document/:id", update);

export default router;