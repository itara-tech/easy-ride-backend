import prisma from '../configs/database.js';

export const createChatRoom = async (customerId, driverId) => {
  const chatRoom = await prisma.chatRoom.create({
    data: {
      customerId,
      driverId,
    },
  });
  return chatRoom;
};

export const createMessage = async (chatRoomId, senderId, content) => {
  // Determine if senderId belongs to customer or driver
  const chatRoom = await prisma.chatRoom.findUnique({
    where: {
      id: chatRoomId
    },
    include: {
      customer: true,
      driver: true
    }
  });

  if (!chatRoom) {
    throw new Error('ChatRoom not found');
  }

  // Check if senderId matches either customer or driver ID
  let customerId = null;
  let driverId = null;

  if (chatRoom.customer && chatRoom.customer.id === senderId) {
    customerId = senderId;
  } else if (chatRoom.driver && chatRoom.driver.id === senderId) {
    driverId = senderId;
  } else {
    throw new Error('Invalid senderId. Sender must be either the customer or driver.');
  }

  // Create the message
  const message = await prisma.message.create({
    data: {
      chatRoomId,
      customerId, // Only pass customerId if it exists
      driverId,   // Only pass driverId if it exists
      content
    }
  });

  return message;
};

export const getMessages = async (chatRoomId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const messages = await prisma.message.findMany({
    where: { chatRoomId },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      }, // Include customer details if sender is a customer
      driver: {
        select:{
          id: true,
          name: true,
          email: true,
          avatar: true,
        }
      },   // Include driver details if sender is a driver
    },
  });

  // Map messages to include sender details
  const messagesWithSenders = messages.map((message) => {
    const sender = message.customer || message.driver; // Determine the sender
    return {
      ...message,
      sender, // Include sender details in the response
    };
  });

  return messagesWithSenders.reverse();
};