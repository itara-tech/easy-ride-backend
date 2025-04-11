import express from 'express';
import {
  createChatRoom,
  sendMessage,
  acceptPriceOffer,
  handleRegret,
  getChatMessages,
} from '../controllers/chatController.js';

const router = express.Router();

// Create a chat room
router.post('/room', createChatRoom);

// Send a message
router.post('/message', sendMessage);

// Accept a price offer
router.post('/accept-offer', acceptPriceOffer);

// Handle price regret
router.post('/regret', handleRegret);

// Fetch messages in a chat room
router.get('/messages/:chatRoomId', getChatMessages);

export default router;
