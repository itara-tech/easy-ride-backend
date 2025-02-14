

## Badges

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://opensource.org/licenses/)
[![AGPL License](https://img.shields.io/badge/license-AGPL-blue.svg)](http://www.gnu.org/licenses/agpl-3.0)


# Easy Ride Backend

Easy Ride is a ride-sharing application backend designed to streamline the process of booking, managing, and completing rides for customers and drivers. This robust system leverages PostgreSQL with Prisma as its ORM, providing high scalability, security, and extensibility.


# Features
## For Customers:
- Registration & Verification: Create an account, verify using OTPs.
- Ride Requests: Book rides with precise source and destination.
- Ratings & Feedback: Rate drivers after ride completion.
- Notifications: Stay updated with ride updates and offers.
- Password Management: Reset forgotten passwords securely.
## For Drivers:
- Driver Verification: Ensure valid drivers with licenses.
- Ride Acceptances: Accept ride requests and start trips.
- Ratings: Get rated by customers for services provided.
Vehicle Management: Manage vehicle details (type, registration, model, etc.).
- Notifications: Get updates on ride requests and trip statuses.

# Core System Features:
- OTP Verification: For secure customer and driver actions.
- Trip Management: Handle ride requests, acceptances, completions, and cancellations.
- Payment Tracking: Manage payment statuses (Pending, Success, Failed).
- Admin Notifications: Maintain communication between users.
- Location Services: Source and destination coordination using JSON data.

# Tech Stack
## Backend:
* Node.js: Server environment.
* Express.js: Web framework for building APIs.
* Prisma: ORM for database management.
* PostgreSQL: Database provider.

# Database Schema
The application uses a relational database schema designed with Prisma. Here are the primary entities:

- Customer: Manages customer details, rides, and ratings.
- Driver: Handles driver information, vehicle details, and ride acceptances.
- Vehicle: Tracks driver vehicles (type, registration, etc.).
- RideRequest: Manages ride requests (source, destination, price).
- Trip: Tracks ride status (Requested, Accepted, Completed, Canceled).
- RideComplete: Manages completed trips and payments.
- RideCancel: Tracks ride cancellations with reasons.
- Notification: For customer and driver updates.
- OTP: For account verification.
- Ratings: Feedback system for customers and drivers.
## Enums:
- UserType: Customer, Driver.
- RideStatus: Requested, Accepted, Completed, Canceled.
- PaymentStatus: Pending, Success, Failed.
- VehicleType: Car, Bike, Van, Truck.

## Install dependencies:

```bash
  npm install

```
## Setup environment variables: Create a .env file and configure the following

```bash
  DATABASE_URL=postgresql_connection_string

```
## Run database migrations:

```bash
  npx prisma migrate dev
  npx prisma generate

```
Start the server:

```bash
    npm start
```
## Appendix

If you have any feedback, please reach out to us at

[itaratechhouse🚀](itaratechhouse.com)
![]


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`DATABASE_URL`

`SMTP_HOST`
`SMTP_PORT`
`SMTP_USER`
`SMTP_PASS`
`EMAIL_FROM`

 Frontend URL for password reset
`FRONTEND_URL`


## Authors

- [DUSHIME1212](https://github.com/DUSHIME1212)
- [Davy](https://github.com/DUSHIME1212)
