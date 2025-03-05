import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import rideRoutes from './routes/rideRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';

import './configs/passport.js';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
export const prisma = new PrismaClient();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
// app.use("/api/notifications", notificationRoutes)
// app.use("/api/payments", paymentRoutes)
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/rides', rideRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

prisma
  .$connect()
  .then(() => {
    console.log('Successfully connected to the database');
  })
  .catch((error) => {
    console.error('Failed to connect to the database:', error);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
Server is running on port ${PORT}
Open http://localhost:${PORT}/api-docs to view the API documentation
Open http://localhost:${PORT}/ to view the API
    `);
});
