FROM node:20-alpine AS builder
WORKDIR /app

# Copy lockfiles first to leverage Docker layer caching
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Export static web build
RUN npx expo export --platform web --output-dir /app/dist

# --- Production stage: serve static files with a lightweight HTTP server ---
FROM node:20-alpine AS runner
WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 19006

CMD ["serve", "-s", "dist", "-l", "19006"]
