# -----------------------
# Stage 1: Build frontend
# -----------------------
FROM node:20-alpine AS build-frontend

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build


# -----------------------
# Stage 2: Backend (simple style)
# -----------------------
FROM node:20-alpine

WORKDIR /app/backend

# Install backend dependencies directly in final image
COPY backend/package*.json ./
RUN npm install

# Copy backend code
COPY backend/ ./

# vite.config.ts builds the frontend directly into ../backend/dist
COPY --from=build-frontend /app/backend/dist ./dist

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["npm", "run", "start"]