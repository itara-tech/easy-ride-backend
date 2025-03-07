import express from 'express';
import { createChatRoom, sendMessage, getChatMessages } from '../controllers/chatController.js';

const router = express.Router();

// Create a chat room
router.post('/room', createChatRoom);

// Send a message
router.post('/message', sendMessage);

// Fetch messages in a chat room
router.get('/messages/:chatRoomId', getChatMessages);

export default router;