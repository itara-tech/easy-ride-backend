import { MailtrapClient } from 'mailtrap';

const TOKEN = process.env.MAILTRAPTOKEN;

export const mailTrapclient = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: 'hello@demomailtrap.com',
  name: 'Mailtrap Test',
};
