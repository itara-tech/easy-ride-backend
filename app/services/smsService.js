import twilio from 'twilio';
import prisma from '../configs/database.js';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export const sendSMS = async (to, body) => {
  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    return message.sid;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

export async function sendsmsOTP(phoneNumber, otpCode) {
  try {
      const message = await client.messages.create({
          body: `Your verification code is: ${otpCode}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber
      });
      
      console.log(`OTP sent to ${phoneNumber}, SID: ${message.sid}`);
      return { success: true, messageSid: message.sid };
  } catch (error) {
      console.error('Error sending OTP:', error);
      return { success: false, error: error.message };
  }
}

export const sendSMSWithTemplate = async (to, template, data) => {
  try {
    const messageBody = template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || '');
    return await sendSMS(to, messageBody);
  } catch (error) {
    console.error('Error sending SMS with template:', error);
    throw error;
  }
}
export const sendSMSWithNotification = async (to, template, data, userId) => {
  try {
    const messageBody = template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || '');
    const messageSid = await sendSMS(to, messageBody);
    
    // Create a notification in the database
    await createNotification(userId, 'SMS Notification', messageBody);
    
    return messageSid;
  } catch (error) {
    console.error('Error sending SMS with notification:', error);
    throw error;
  }
}

// Helper function for notifications
const createNotification = async (userId, title, body) => {
  try {
    // Determine if user is customer or driver
    const user = await prisma.customer.findUnique({ where: { id: userId } }) || 
                  await prisma.driver.findUnique({ where: { id: userId } });
    
    if (!user) return;

    await prisma.notification.create({
      data: {
        title,
        body,
        [user.email.includes('@driver.') ? 'driverId' : 'customerId']: userId
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}