FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

# Production flags
ENV NODE_ENV production

CMD ["node", "server.js"]
