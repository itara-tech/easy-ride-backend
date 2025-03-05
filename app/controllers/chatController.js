import * as chatService from '../services/chatService.js';

export const createChatRoom = async (req, res) => {
  const { customerId, driverId } = req.body;
  try {
    const chatRoom = await chatService.createChatRoom(customerId, driverId);
    res.status(201).json(chatRoom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
