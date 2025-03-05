const PaypackJs = require('paypack-js').default;

const paypackClient = new PaypackJs({
  client_id: process.env.PAYPACK_CLIENT_ID,
  client_secret: process.env.PAYPACK_CLIENT_SECRET,
});

export default paypackClient;
