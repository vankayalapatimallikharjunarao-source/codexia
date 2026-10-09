# ---------- Stage 1: build (frontend via Vite + server bundle via esbuild) ----------
FROM node:22-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Stage 2: lean production runtime ----------
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

# Cloud Run injects PORT (8080); server.ts reads process.env.PORT
EXPOSE 8080
CMD ["node", "dist/server.cjs"]
