import prisma from '../configs/database.js';

export const createChatRoom = async (customerId, driverId, rideRequestId) => {
  // Verify all entities exist first
  await Promise.all([
    prisma.customer.findUniqueOrThrow({ where: { id: customerId } }),
    prisma.driver.findUniqueOrThrow({ where: { id: driverId } }),
    prisma.rideRequest.findUniqueOrThrow({ where: { id: rideRequestId } }),
  ]);

  const chatRoom = await prisma.chatRoom.create({
    data: {
      customer: { connect: { id: customerId } },
      driver: { connect: { id: driverId } },
      rideRequest: { connect: { id: rideRequestId } },
    },
    include: {
      customer: true,
      driver: true,
      rideRequest: true,
    },
  });
  return chatRoom;
};

export const createMessage = async (chatRoomId, senderId, content, priceOffer = null) => {
  const chatRoom = await prisma.chatRoom.findUnique({
    where: { id: chatRoomId },
    include: {
      customer: true,
      driver: true,
      rideRequest: true,
    },
  });

  if (!chatRoom) {
    throw new Error('ChatRoom not found');
  }

  // Check if sender is part of this chat room
  const isCustomer = chatRoom.customer.id === senderId;
  const isDriver = chatRoom.driver.id === senderId;

  if (!isCustomer && !isDriver) {
    throw new Error('Invalid senderId. Sender must be either the customer or driver.');
  }

  // Validate price offer if present
  if (priceOffer !== null) {
    if (typeof priceOffer !== 'number' || priceOffer <= 0) {
      throw new Error('Price offer must be a positive number');
    }

    // Notify the other party about the new offer
    const recipientId = isCustomer ? chatRoom.driver.id : chatRoom.customer.id;
    await createNotification(recipientId, 'New Price Offer', `New price offer: ${priceOffer}`);
  }

  // Create the message
  const message = await prisma.message.create({
    data: {
      chatRoom: { connect: { id: chatRoomId } },
      [isCustomer ? 'customer' : 'driver']: { connect: { id: senderId } },
      content,
      priceOffer,
      isPriceAccepted: false,
    },
    include: {
      customer: isCustomer ? { select: { id: true, name: true, avatar: true } } : false,
      driver: isDriver ? { select: { id: true, name: true, avatar: true } } : false,
    },
  });

  return message;
};

export const acceptPriceOffer = async (messageId, acceptorId) => {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      chatRoom: {
        include: {
          customer: true,
          driver: true,
          rideRequest: true,
        },
      },
    },
  });

  if (!message) {
    throw new Error('Message not found');
  }

  // Verify the acceptor is the other party in the chat
  const isCustomer = message.chatRoom.customer.id === acceptorId;
  const isDriver = message.chatRoom.driver.id === acceptorId;

  if (!isCustomer && !isDriver) {
    throw new Error('Only the other party can accept a price offer');
  }

  if (!message.priceOffer) {
    throw new Error('This message does not contain a price offer');
  }

  // Update the ride request with the accepted price
  await prisma.rideRequest.update({
    where: { id: message.chatRoom.rideRequest.id },
    data: {
      estimatedPrice: message.priceOffer,
      status: 'ACCEPTED',
    },
  });

  // Mark the price as accepted
  const updatedMessage = await prisma.message.update({
    where: { id: messageId },
    data: { isPriceAccepted: true },
  });

  // Notify both parties
  await Promise.all([
    createNotification(
      message.chatRoom.customer.id,
      'Price Accepted',
      `The price of ${message.priceOffer} has been accepted`,
    ),
    createNotification(
      message.chatRoom.driver.id,
      'Price Accepted',
      `The price of ${message.priceOffer} has been accepted`,
    ),
  ]);

  return updatedMessage;
};

export const handleRegret = async (chatRoomId, regretterId) => {
  const chatRoom = await prisma.chatRoom.findUnique({
    where: { id: chatRoomId },
    include: {
      customer: true,
      driver: true,
      rideRequest: true,
    },
  });

  if (!chatRoom) {
    throw new Error('ChatRoom not found');
  }

  // Verify the regretter is part of this chat
  const isCustomer = chatRoom.customer.id === regretterId;
  const isDriver = chatRoom.driver.id === regretterId;

  if (!isCustomer && !isDriver) {
    throw new Error('Only participants can regret a price agreement');
  }

  // Update the ride request status
  await prisma.rideRequest.update({
    where: { id: chatRoom.rideRequest.id },
    data: { status: 'CANCELED' },
  });

  // Create a regret message
  const regretMessage = await prisma.message.create({
    data: {
      chatRoomId,
      [isCustomer ? 'customerId' : 'driverId']: regretterId,
      content: `I regret the agreed price and am canceling this ride.`,
      isRegret: true,
    },
  });

  // Notify the other party
  await createNotification(
    isCustomer ? chatRoom.driver.id : chatRoom.customer.id,
    'Ride Canceled',
    'The other party has canceled the ride due to price regret',
  );

  return regretMessage;
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
      },
      driver: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  const messagesWithSenders = messages.map((message) => {
    const sender = message.customer || message.driver;
    return {
      ...message,
      sender,
    };
  });

  return messagesWithSenders.reverse();
};

// Helper function for notifications
async function createNotification(userId, title, message) {
  try {
    // Determine if user is customer or driver
    const user =
      (await prisma.customer.findUnique({ where: { id: userId } })) ||
      (await prisma.driver.findUnique({ where: { id: userId } }));

    if (!user) return;

    await prisma.notification.create({
      data: {
        title,
        message,
        [user.email.includes('@driver.') ? 'driverId' : 'customerId']: userId,
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}
