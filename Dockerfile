# --- Stage 1: build React ---
FROM node:18-alpine AS build
WORKDIR /app

# Copy package và install dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ source và build React
COPY . .
RUN npm run build

# --- Stage 2: runtime Node ---
FROM node:18-alpine
WORKDIR /app

# Copy build React và server.js sang
COPY --from=build /app/build ./build
COPY package*.json server.js ./
COPY src ./src
COPY . .
# Cài dependencies backend
RUN npm install --production

EXPOSE 5000

# Chạy Node server
CMD ["node", "server.js"]
