import prisma from '../configs/database.js';
import * as chatService from '../services/chatService.js';

// Create a chat room
export const createChatRoom = async (req, res) => {
  const { customerId, driverId } = req.body;

  if (!customerId || !driverId) {
    return res.status(400).json({ error: 'customerId and driverId are required' });
  }

  try {
    const chatRoom = await chatService.createChatRoom(customerId, driverId);
    res.status(201).json(chatRoom);
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ error: error.message });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  const { chatRoomId, senderId, content } = req.body;

  if (!chatRoomId || !senderId || !content) {
    return res.status(400).json({ error: 'chatRoomId, senderId, and content are required' });
  }

  const chatRoom = await prisma.chatRoom.findUnique({
    where: {
      id: chatRoomId
    }
  });
  
  
  if (!chatRoom) {
    throw new Error('ChatRoom not found');
  }

  try {
    const message = await chatService.createMessage(chatRoomId, senderId, content);
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
};

// Fetch messages in a chat room
export const getChatMessages = async (req, res) => {
  const { chatRoomId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  if (!chatRoomId) {
    return res.status(400).json({ error: 'chatRoomId is required' });
  }

  try {
    const messages = await chatService.getMessages(chatRoomId, parseInt(page), parseInt(limit));
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
};