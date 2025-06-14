import express from "express";
import { pageController } from "../controllers/page.controller";
import { checkSuperAdmin } from "../middleware/auth";

const router = express.Router();

router.post("/", checkSuperAdmin, pageController.createPage)
router.post("/:page", checkSuperAdmin,pageController.createPageSection);
router.get("/config", pageController.getConfig);
router.get("/", checkSuperAdmin, pageController.getPages);
router.get("/iterable", checkSuperAdmin, pageController.getIterablePages);
router.get("/:page", checkSuperAdmin, pageController.getPageContent);
router.put("/:page/:sectionId", checkSuperAdmin, pageController.updatePageSection);
router.delete("/:page", checkSuperAdmin, pageController.deletePage)
router.delete("/:page/:sectionId", checkSuperAdmin, pageController.deletePageSection);

export default router;