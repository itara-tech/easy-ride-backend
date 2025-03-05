import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as AppleStrategy } from 'passport-apple';
import prisma from './database.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.customer.findUnique({ where: { googleId: profile.id } });
        if (!user) {
          user = await prisma.customer.create({
            data: {
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
            },
          });
        }
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    },
  ),
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: '/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.customer.findUnique({ where: { facebookId: profile.id } });
        if (!user) {
          user = await prisma.customer.create({
            data: {
              facebookId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
            },
          });
        }
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    },
  ),
);

passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      callbackURL: '/auth/apple/callback',
      keyID: process.env.APPLE_KEY_ID,
      privateKeyLocation: process.env.APPLE_PRIVATE_KEY_LOCATION,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.customer.findUnique({ where: { appleId: profile.id } });
        if (!user) {
          user = await prisma.customer.create({
            data: {
              appleId: profile.id,
              name: profile.name.firstName + ' ' + profile.name.lastName,
              email: profile.email,
            },
          });
        }
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    },
  ),
);

export default passport;
