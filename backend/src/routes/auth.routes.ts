import { Router } from "express";
import passport from "passport";
import { authCheck, learnifierAccount } from "../middleware/auth";
import { authController } from "../controllers/auth.controller";
import { FRONTEND_BASE_URL } from "../config/api";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", {
    // initiates passport process -> passport.ts
    // scope defines what variabels we want from the google account API
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${FRONTEND_BASE_URL}`,
    failureMessage: true,
  }),
  authCheck,
  learnifierAccount,
  authController.oauthCallback
);
router.get("/logout", authCheck, authController.logout);
router.get("/current/log", authCheck, authController.getAuth);

export default router;
