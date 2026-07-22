# Production Dockerfile for Google Cloud Run deployment
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy full application source
COPY . .

# Build Vite frontend and esbuild server bundle
RUN npm run build

# Runner stage for optimized container image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy package manifest and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled distribution files
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/server.cjs"]
