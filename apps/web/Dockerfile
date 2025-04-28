# Base image for Node.js
FROM node:20.18.1-alpine AS base
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build application
RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
ENV NODE_ENV=production

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set the proper user
USER nextjs

# Expose port and define health check
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD wget -qO- http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"] 