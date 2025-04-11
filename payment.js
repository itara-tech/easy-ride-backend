import { processPayment } from './app/services/paypackService.js';

processPayment(1000, '0782454192', 'Test payment')
  .then((response) => {
    console.log('Payment successful:', response);
  })
  .catch((error) => {
    console.error('Payment failed:', error);
  });
