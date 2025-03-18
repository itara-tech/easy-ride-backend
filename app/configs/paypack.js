import Paypack from 'paypack-js';


console.log('Client ID:', process.env.PAYPACK_CLIENT_ID);
console.log('Client Secret:', process.env.PAYPACK_CLIENT_SECRET);


const paypackClient = new Paypack({
  client_id: process.env.PAYPACK_CLIENT_ID,
  client_secret: process.env.PAYPACK_CLIENT_SECRET,
});


console.log(paypackClient);


export default paypackClient;
