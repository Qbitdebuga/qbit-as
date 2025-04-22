#!/bin/bash
# Script to install required dependencies for event publishing

# Text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up Event Publishing for Auth Service...${NC}"

# Install microservices dependencies
echo -e "${YELLOW}Installing required dependencies...${NC}"
npm install @nestjs/microservices amqp-connection-manager amqplib --save

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Dependencies installed successfully!${NC}"
    
    # Remind user to uncomment the ClientsModule in events.module.ts
    echo -e "${YELLOW}Now you need to uncomment the ClientsModule in src/events/events.module.ts${NC}"
    echo -e "${YELLOW}and uncomment the @InjectClient decorator in the publishers.${NC}"
    
    # Check if RabbitMQ environment variables are set
    echo -e "${YELLOW}Checking environment variables...${NC}"
    
    if grep -q "RABBITMQ_URL" ../.env; then
        echo -e "${GREEN}RabbitMQ environment variables found.${NC}"
    else
        echo -e "${RED}RabbitMQ environment variables not found in .env file.${NC}"
        echo -e "${YELLOW}Please add the following to your .env file:${NC}"
        echo -e "RABBITMQ_URL=amqp://qbit:qbit_password@localhost:5672"
        echo -e "RABBITMQ_QUEUE=auth_queue"
        echo -e "RABBITMQ_EXCHANGE=qbit_events"
    fi
    
    echo -e "${GREEN}Event Publishing setup complete!${NC}"
else
    echo -e "${RED}Failed to install dependencies. Please try again or install manually.${NC}"
    exit 1
fi 