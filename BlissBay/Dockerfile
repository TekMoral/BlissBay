FROM node:20-alpine

WORKDIR /app

# Install build tools for any native dependencies (some packages need it)
RUN apk add --no-cache python3 make g++


# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies with necessary build tools for native modules
# Alpine needs additional packages to compile native modules
RUN apk add --no-cache python3 make g++ 
RUN npm install

# Copy only necessary files
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Command to run the app
CMD ["npm", "start"]