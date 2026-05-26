# === BUILD STAGE ===
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Pre-build optimization (if applicable)
RUN npm run build 2>/dev/null || true

# === PRODUCTION STAGE ===
FROM node:20-alpine

WORKDIR /app

# Install expo-cli globally
RUN npm install -g expo-cli@^7.0.0

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy node_modules and app from builder
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app ./

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3100', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose ports
# 3100: Web server
# 19000: Expo dev server (Metro bundler)
# 19001: Expo dev server (secondary)
EXPOSE 3100 19000 19001

# Start application
CMD ["npm", "start"]
