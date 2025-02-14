import request from 'supertest';
import app from '../app';

describe('Ride Routes', () => {
  let tokenCustomer;
  let tokenDriver;

  beforeAll(async () => {
    const customerResponse = await request(app)
      .post('/auth/login')
      .send({ username: 'customer', password: 'password' });
    tokenCustomer = customerResponse.body.token;

    const driverResponse = await request(app)
      .post('/auth/login')
      .send({ username: 'driver', password: 'password' });
    tokenDriver = driverResponse.body.token;
  });

  test('Create a new ride request (customer only)', async () => {
    const response = await request(app)
      .post('/rides/request')
      .set('Authorization', `Bearer ${tokenCustomer}`)
      .send({
        "customerId": "{{customerId}}",
        "pickupLocation": {
          "lat": -1.9403,
          "lon": 30.0619,
          "address": "123 Main "
        },
        "dropoffLocation": {
          "lat": -1.9503,
          "lon": 30.0719,
          "address": "456 Elm St"
        }
      });
    expect(response.status).toBe(201);
  });

  test('Accept a ride (driver only)', async () => {
    const response = await request(app)
      .put('/rides/accept')
      .set('Authorization', `Bearer ${tokenDriver}`)
      .send({
        "rideId": "{{rideId}}",
        "driverId": "{{driverId}}"
      });
    expect(response.status).toBe(200);
  });

  test('Complete a ride (driver only)', async () => {
    const response = await request(app)
      .put('/rides/complete')
      .set('Authorization', `Bearer ${tokenDriver}`)
      .send({
        "rideId": "{{rideId}}",
        "finalAmount": 20.00
      });
    expect(response.status).toBe(200);
  });

  test('Cancel a ride (customer only)', async () => {
    const response = await request(app)
      .put('/rides/cancel')
      .set('Authorization', `Bearer ${tokenCustomer}`)
      .send({
        "tripId": "{{tripId}}",
        "canceledByType": "CUSTOMER",
        "canceledById": "{{customerId}}",
        "reason": "Customer changed their plans"
      });
    expect(response.status).toBe(200);
  });

  test('Get nearby ride requests (driver only)', async () => {
    const response = await request(app)
      .get('/rides/nearby')
      .set('Authorization', `Bearer ${tokenDriver}`);
    expect(response.status).toBe(200);
    
  });
});
