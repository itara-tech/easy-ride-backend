import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
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

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, async (jwtPayload, done) => {
    try {
      let user;
      if (jwtPayload.userType === 'CUSTOMER') {
        user = await prisma.customer.findUnique({ where: { id: jwtPayload.id } });
      } else if (jwtPayload.userType === 'DRIVER') {
        user = await prisma.driver.findUnique({ where: { id: jwtPayload.id } });
      }

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  }),
);

export default passport;
