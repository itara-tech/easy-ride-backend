import passport from "passport"
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt"
import { PrismaClient } from "@prisma/client"
import { prisma } from "../Server.js"


const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
}

passport.use(
    new JwtStrategy(options, async (jwtPayload, done) => {
        try {
            let user = null

            if (jwtPayload.userType === "CUSTOMER") {
                user = await prisma.customer.findUnique({
                    where: { id: jwtPayload.id },
                })
            } else if (jwtPayload.userType === "DRIVER") {
                user = await prisma.driver.findUnique({
                    where: { id: jwtPayload.id },
                })
            }

            if (user) {
                return done(null, { ...user, userType: jwtPayload.userType })
            }
            return done(null, false)
        } catch (error) {
            return done(error, false)
        }
    })
)