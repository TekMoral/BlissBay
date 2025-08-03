
# Use an official Node runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port on which Vite runs (default is 5173)
EXPOSE 5173

# Start the Vite dev server (this should be adjusted if your package.json dev script differs)
CMD ["npm", "run", "dev"]

