import { Router } from "express";
import { documentController } from "../controllers/documents.controller";
import { documentUpload } from "../services/fileUpload/documentUpload";
import { checkSuperAdmin } from "../middleware/auth";

const router = Router();

// Document routes
router.post("/", checkSuperAdmin, documentUpload, documentController.create);
router.get("/", documentController.getAll);
router.put("/:docId",checkSuperAdmin, documentUpload, documentController.update);
router.delete("/:docId", checkSuperAdmin, documentController.delete);

export default router;
