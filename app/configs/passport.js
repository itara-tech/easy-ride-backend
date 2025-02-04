import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { Strategy as FacebookStrategy } from "passport-facebook"
import { Strategy as AppleStrategy } from "passport-apple"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({ where: { email: profile.emails[0].value } })
        if (!user) {
          user = await prisma.user.create({
            data: {
              name: profile.displayName,
              email: profile.emails[0].value,
              role: "user",
            },
          })
        }
        done(null, user)
      } catch (error) {
        done(error, null)
      }
    },
  ),
)

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/api/auth/facebook/callback",
      profileFields: ["id", "displayName", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({ where: { email: profile.emails[0].value } })
        if (!user) {
          user = await prisma.user.create({
            data: {
              name: profile.displayName,
              email: profile.emails[0].value,
              role: "user",
            },
          })
        }
        done(null, user)
      } catch (error) {
        done(error, null)
      }
    },
  ),
)

passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      callbackURL: "/api/auth/apple/callback",
      keyID: process.env.APPLE_KEY_ID,
      privateKeyLocation: process.env.APPLE_PRIVATE_KEY_LOCATION,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({ where: { email: profile.email } })
        if (!user) {
          user = await prisma.user.create({
            data: {
              name: profile.name.firstName + " " + profile.name.lastName,
              email: profile.email,
              role: "user",
            },
          })
        }
        done(null, user)
      } catch (error) {
        done(error, null)
      }
    },
  ),
)

export default passport

