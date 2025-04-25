import passport from 'passport';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// to authenticate JWT token
export const authenticateToken = passport.authenticate('jwt', { session: false });

export const authenticate = authenticateToken;
console.log(authenticate);

// to check if user is a customer
export const isCustomer = async (req, res, next) => {
  try {
    const user = await prisma.customer.findUnique({ where: { id: req.user.id } });
    console.log(user);

    if (!user) {
      return res.status(403).json({ message: 'Access denied. Customer only.' });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

// to check if user is a driver
export const isDriver = async (req, res, next) => {
  try {
    const user = await prisma.driver.findUnique({ where: { id: req.user.id } });
    console.log(user);
    if (!user) {
      return res.status(403).json({ message: 'Access denied. Driver only.' });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

// to check if user owns the resource
export const isResourceOwner = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Access denied. Not the resource owner.' });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};


export const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin in either table
    const [customerAdmin, driverAdmin] = await Promise.all([
      prisma.customer.findUnique({
        where: { 
          email: decoded.email,
          isAdmin: true 
        }
      }),
      prisma.driver.findUnique({
        where: { 
          email: decoded.email,
          isAdmin: true 
        }
      })
    ]);

    if (!customerAdmin && !driverAdmin) {
      return res.status(403).json({ error: 'Not authorized as admin' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Failed to authenticate as admin' });
  }
};
