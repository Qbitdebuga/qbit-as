#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Building @qbit/tracing package...${NC}"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  yarn install
fi

# Clean the dist directory if it exists
if [ -d "dist" ]; then
  echo -e "${YELLOW}Cleaning dist directory...${NC}"
  rm -rf dist
fi

# Build the package
echo -e "${YELLOW}Compiling TypeScript...${NC}"
yarn tsc

# Check if build was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Build successful!${NC}"
  echo -e "${GREEN}The package is now ready to use.${NC}"
  echo -e "${YELLOW}To view traces, run Jaeger using:${NC}"
  echo -e "  docker-compose up -d jaeger"
  echo -e "${YELLOW}Then open http://localhost:16686 in your browser${NC}"
else
  echo -e "${RED}Build failed!${NC}"
  exit 1
fi 