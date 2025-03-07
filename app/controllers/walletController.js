import * as walletService from '../services/walletService.js';

export const createWallet = async (req, res) => {
  const { userId, userType } = req.body;
  try {
    const wallet = await walletService.createWallet(userId, userType);
    res.status(201).json(wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getWalletBalance = async (req, res) => {
  const { userId } = req.params;
  try {
    const balance = await walletService.getWalletBalance(userId);
    res.json({ balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addFunds = async (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;
  try {
    const updatedWallet = await walletService.addFunds(userId, amount);
    res.json(updatedWallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deductFunds = async (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;
  try {
    const updatedWallet = await walletService.deductFunds(userId, amount);
    res.json(updatedWallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
