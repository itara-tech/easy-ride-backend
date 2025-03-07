import axios from 'axios';

const BASE_URL = 'https://api.paypack.rw';

const getToken = async (clientId, clientSecret) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/agents/authorize`, {
      client_id: clientId,
      client_secret: clientSecret,
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Paypack token:', error);
    throw new Error('Failed to authenticate with Paypack');
  }
};

const makeRequest = async (method, endpoint, data, clientId, clientSecret) => {
  const token = await getToken(clientId, clientSecret);
  try {
    const response = await axios({
      method,
      url: `${BASE_URL}${endpoint}`,
      data,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error making Paypack ${method} request:`, error);
    throw error;
  }
};

export const Cashin = async ({ number, amount, environment, clientId, clientSecret }) => {
  return makeRequest('POST', '/api/transactions/cashin', { number, amount, environment }, clientId, clientSecret);
};

export const Cashout = async ({ number, amount, environment, clientId, clientSecret }) => {
  return makeRequest('POST', '/api/transactions/cashout', { number, amount, environment }, clientId, clientSecret);
};

export const Transactions = async ({ offset, limit, clientId, clientSecret }) => {
  return makeRequest('GET', `/api/transactions?offset=${offset}&limit=${limit}`, null, clientId, clientSecret);
};

export const Me = async ({ clientId, clientSecret }) => {
  return makeRequest('GET', '/api/me', null, clientId, clientSecret);
};
