import prisma from '../configs/database.js';

export const createWallet = async (userId, userType) => {
  const wallet = await prisma.wallet.create({
    data: {
      userId,
      userType,
      balance: 0,
    },
  });
  return wallet;
};

export const getWalletBalance = async (userId) => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });
  return wallet ? wallet.balance : 0;
};

export const addFunds = async (userId, amount) => {
  const updatedWallet = await prisma.wallet.update({
    where: { userId },
    data: {
      balance: {
        increment: amount,
      },
    },
  });
  return updatedWallet;
};

export const deductFunds = async (userId, amount) => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (wallet.balance < amount) {
    throw new Error('Insufficient funds');
  }

  const updatedWallet = await prisma.wallet.update({
    where: { userId },
    data: {
      balance: {
        decrement: amount,
      },
    },
  });
  return updatedWallet;
};
