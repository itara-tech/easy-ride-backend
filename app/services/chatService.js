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
  const message = await prisma.message.create({
    data: {
      chatRoomId,
      senderId,
      content,
    },
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
    include: { sender: true },
  });
  return messages.reverse();
};
