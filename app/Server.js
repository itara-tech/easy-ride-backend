import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import passport from "passport"
import swaggerUi from "swagger-ui-express"
import swaggerJsdoc from "swagger-jsdoc"
import dotenv from "dotenv"

import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import rideRoutes from "./routes/rideRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"
import vehicleRoutes from "./routes/vehicleRoutes.js"

import "./configs/passport.js"

dotenv.config()

const app = express()


app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())


const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Easy Ride Sharing API",
      version: "1.0.0",
      description: "API documentation for the Ride-Sharing application",
      contact: {
        name: "Dushime Don Aime",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://easy-ride-backend.vercel.app/",
        description: "Production server",
      },
    ],
  },
  apis: ["./routes/authRoutes.js"],

}

const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use("/", 
    (req, res) => 
    res.send("Welcome to the Ride-Sharing API")

)



app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/rides", rideRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/vehicles", vehicleRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`

Server is running on port ${PORT}
Open http://localhost:${PORT}/api-docs view the API documentation
Open http://localhost:${PORT}/ view the API documentation

    `)
})

export default app

