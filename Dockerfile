# Step 1: Use Node.js as the base image
FROM node:18-alpine

# Step 2: Set the working directory
WORKDIR /usr/src/app

# Step 3: Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Step 4: Install dependencies
RUN yarn install --production

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Build the application
RUN yarn build

# Step 7: Expose the application port
EXPOSE 3000

# Step 8: Start the application
CMD ["node", "dist/main.js"]
