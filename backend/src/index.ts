import express from "express";
import passport from "passport";
import cookieSession from "cookie-session";
import cors from "cors";
import nodemailer from 'nodemailer';
const setup = require("./utils/passport");
import fs from "fs";
import path from "path";
import { FRONTEND_BASE_URL, BACKEND_PORT } from "./config/api";

// Route imports
import authRoutes from "./routes/auth.routes";
import learnifierRoutes from "./routes/learnifier.routes";
import meRoutes from "./routes/me.routes";
import userRoutes from "./routes/user.routes";
import pagesRoutes from './routes/page.routes'

import organizationRouter from "./routes/organization.routes";
import orgprofileRouter from "./routes/organization.profile.routes";
import orgcourseRoutes from "./routes/organization.course.routes";
import subscriptionRouter from "./routes/subscription.routes";
import demoRouter from "./routes/demo.routes";

import courseRoutes from "./routes/course.routes";
import teamRoutes from "./routes/team.routes";
import gameformatRoutes from "./routes/gameformat.routes";
import feedbackRoutes from "./routes/feedback.routes";
import documentsRoutes from "./routes/documents.routes";
import testRoutes from "./routes/test.routes";
import priceRoutes from "./routes/price.routes";
import registerRoutes from "./routes/register.routes";

// Middleware
import noCacheMiddleware from "./middleware/noCache";



// Ensure upload directories exist
const uploadDirs = [
  "uploads",
  "uploads/temp",
  "uploads/logos",
  "uploads/documents",
  "uploads/document-previews",
  "uploads/images",
];

uploadDirs.forEach((dir) => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
});

// Express
const app = express();


// Cookies
app.use(
  cookieSession({
    name: "academy",
    keys: [`${process.env.SESSION_KEY}`, `${process.env.SECRET_SESSION_KEY}`],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

// Email transport

export const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.PLAYER_GMAIL_EMAIL ? process.env.PLAYER_GMAIL_EMAIL : '' ,
    pass: process.env.PLAYER_GMAIL_PASSWORD ? process.env.PLAYER_GMAIL_PASSWORD : '' 
  }
})
// Session
app.use(function (request, response, next) {
  if (request.session && !request.session.regenerate) {
    request.session.regenerate = (cb: Function) => {
      cb();
    };
  }
  if (request.session && !request.session.save) {
    request.session.save = (cb: Function) => {
      cb();
    };
  }
  next();
});

// Passport
app.use(passport.initialize());
app.use(passport.session());


let normalizedFrontendUrl: string;

if (process.env.FRONTEND_URL) {
  normalizedFrontendUrl = process.env.FRONTEND_URL.replace(/\/$/, "");
} else {
  normalizedFrontendUrl = FRONTEND_BASE_URL;
}

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean | string) => void) => {
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/$/, "");
    if (normalizedOrigin === normalizedFrontendUrl) {
      return callback(null, origin);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};


// CORS
console.log("CORS Options:", corsOptions);
app.use(cors(corsOptions));
app.use(express.json());
// Routes
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "The Players Academy API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    corsSettings: corsOptions.origin
  });
});

app.use("/me", meRoutes);
app.use("/organizations", organizationRouter);
app.use("/subscriptions", subscriptionRouter);
app.use("/orgprofiles", orgprofileRouter);
app.use("/users", userRoutes);
app.use("/courses", courseRoutes);
app.use("/auth", authRoutes);
app.use("/learnifier", learnifierRoutes);

app.use("/demo", demoRouter);
app.use("/orgcourses", orgcourseRoutes);
app.use("/teams", teamRoutes);
app.use("/gameformats", gameformatRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/documents", documentsRoutes);
app.use("/pages", pagesRoutes);
app.use(
  "/uploads",
  noCacheMiddleware,
  express.static(path.join(process.cwd(), "uploads"))
);
app.use("/test", testRoutes);
app.use("/prices", priceRoutes);
app.use("/register", registerRoutes);

// Server
app.listen(BACKEND_PORT, () => {
  console.log(`Server is running on port ${BACKEND_PORT}`);
});
