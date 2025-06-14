import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import { Profile, SerializeUser } from "../types/models";
import { prisma } from "../lib/prisma";
const username = process.env.LEANIFIER_PUBLIC_KEY;
const password = process.env.LEARNIFIER_SECRET_KEY;
const auth = btoa(`${username}:${password}`);
import { BACKEND_BASE_URL } from "../config/api";

passport.serializeUser((user: SerializeUser, done) => {
    done(null, user);
});

passport.deserializeUser((user: SerializeUser, done) => {
    done(null, user);
});

const ID = process.env.GOOGLE_CLIENT_ID || "";
const SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn(
    "Google OAuth credentials are missing. Google authentication will be disabled."
  );
  console.warn(
    "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file to enable Google login."
  );
} else {
  passport.use(
    new GoogleStrategy(
        {
        clientID: ID,
        clientSecret: SECRET,
        callbackURL: `${BACKEND_BASE_URL}/auth/google/callback`,
        },
        async (_accessToken, _refreshToken, profile: Profile, done) => {
        // callback after google login is completed
        console.log("starting");
        const firstName = profile.given_name ? profile.given_name : 'John';
        const lastName = profile.family_name ? profile.family_name : 'Doe';
        const email = profile.email;

        try {
          prisma.user
            .findUnique({ where: { email: email } })
            .then(async (user) => {
              if (user) {
                done(null, {
                  email: user.email,
                  role: user.role,
                  id: user.id,
                  firstName: user.firstName,
                  lastName: user.lastName, status: false,
                });
              } else {
                const user = await prisma.user.create({
                  data: { firstName, lastName, email },
                });
                done(null, {
                  email: user.email,
                  role: user.role,
                  id: user.id,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  status: true,
                });
              }
            });
        } catch (error) {
          console.error("error:", error);
        }
      }
    )
  );
}
