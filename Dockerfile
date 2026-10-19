FROM node:20-alpine

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install

COPY backend/ ./

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["npm", "run", "start"]
