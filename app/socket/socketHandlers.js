import jwt from 'jsonwebtoken';
import { createMessage, getMessages } from '../services/chatService.js';
import { createNotification } from '../services/notificationService.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const setupSocketHandlers = (io) => {
  io.use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
      jwt.verify(socket.handshake.query.token, JWT_SECRET, (err, decoded) => {
        if (err) return next(new Error('Authentication error'));
        socket.decoded = decoded;
        next();
      });
    } else {
      next(new Error('Authentication error'));
    }
  }).on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User joined room ${roomId}`);
    });

    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`User left room ${roomId}`);
    });

    socket.on('send_message', async (data) => {
      try {
        const message = await createMessage(data.roomId, socket.decoded.id, data.content);
        io.to(data.roomId).emit('new_message', message);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    socket.on('get_messages', async (data) => {
      try {
        const messages = await getMessages(data.roomId, data.page, data.limit);
        socket.emit('messages', messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
};

export const sendNotification = async (io, userId, notification) => {
  try {
    const createdNotification = await createNotification(userId, notification.title, notification.message);
    io.to(userId).emit('new_notification', createdNotification);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};
