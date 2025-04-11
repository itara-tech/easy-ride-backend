import prisma from '../configs/database.js';
import * as chatService from '../services/chatService.js';

// Create a chat room
export const createChatRoom = async (req, res) => {
  const { customerId, driverId, rideRequestId } = req.body;

  if (!customerId || !driverId || !rideRequestId) {
    return res.status(400).json({ error: 'customerId, driverId, and rideRequestId are required' });
  }

  try {
    // Check if chat room already exists
    const existingRoom = await prisma.chatRoom.findUnique({
      where: { rideRequestId }
    });

    if (existingRoom) {
      return res.status(200).json(existingRoom);
    }

    const chatRoom = await chatService.createChatRoom(customerId, driverId, rideRequestId);
    res.status(201).json(chatRoom);
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ error: error.message });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  const { chatRoomId, senderId, content, priceOffer } = req.body;

  if (!chatRoomId || !senderId || !content) {
    return res.status(400).json({ error: 'chatRoomId, senderId, and content are required' });
  }

  try {
    const message = await chatService.createMessage(chatRoomId, senderId, content, priceOffer);
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
};

// Accept a price offer
export const acceptPriceOffer = async (req, res) => {
  const { messageId, acceptorId } = req.body;

  if (!messageId || !acceptorId) {
    return res.status(400).json({ error: 'messageId and acceptorId are required' });
  }

  try {
    const message = await chatService.acceptPriceOffer(messageId, acceptorId);
    res.status(200).json(message);
  } catch (error) {
    console.error('Error accepting price offer:', error);
    res.status(500).json({ error: error.message });
  }
};

// Handle price regret
export const handleRegret = async (req, res) => {
  const { chatRoomId, regretterId } = req.body;

  if (!chatRoomId || !regretterId) {
    return res.status(400).json({ error: 'chatRoomId and regretterId are required' });
  }

  try {
    const message = await chatService.handleRegret(chatRoomId, regretterId);
    res.status(200).json(message);
  } catch (error) {
    console.error('Error handling regret:', error);
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