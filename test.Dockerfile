# Base image
FROM node:20-alpine AS base
WORKDIR /app
RUN echo "This is the base stage"

# Builder stage
FROM base AS builder
RUN echo "This is the builder stage"
# Create a test file
RUN echo "Hello from the builder stage" > test.txt

# Final stage
FROM base AS final
COPY --from=builder /app/test.txt .
RUN echo "Content of test.txt:"
RUN cat test.txt

# Output to confirm multi-stage build works
CMD ["cat", "test.txt"] 