# Stage 1: Build the React application
FROM node:20 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the React application for production
RUN npm run build

# Stage 2: Serve the React application using Nginx
FROM nginx:alpine

# Copy the build output to the Nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx configuration if you have one (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port that Nginx will use
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]