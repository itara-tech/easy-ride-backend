# Base image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy everything else
COPY . .

# Move into server directory
WORKDIR /app/app

# Copy env if needed
COPY .env .env

# Expose the port
EXPOSE 3000

# Start the app
CMD ["node", "Server.js"]
