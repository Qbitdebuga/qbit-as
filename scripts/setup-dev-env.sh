#!/bin/bash

# Script to set up Qbit development environment
# This script starts all required services and initializes configurations

# Text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if Docker is running
check_docker() {
  echo -e "${YELLOW}Checking if Docker is running...${NC}"
  if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Docker is not running. Please start Docker and try again.${NC}"
    exit 1
  fi
  echo -e "${GREEN}Docker is running.${NC}"
}

# Function to check if docker-compose exists
check_docker_compose() {
  echo -e "${YELLOW}Checking for docker-compose...${NC}"
  if ! command -v docker-compose > /dev/null 2>&1; then
    echo -e "${RED}docker-compose not found. Please install docker-compose and try again.${NC}"
    exit 1
  fi
  echo -e "${GREEN}docker-compose is installed.${NC}"
}

# Main setup function
setup_environment() {
  echo -e "${YELLOW}Starting Qbit development environment setup...${NC}"
  
  # Starting infrastructure services
  echo -e "${YELLOW}Starting infrastructure services (PostgreSQL, RabbitMQ, Consul)...${NC}"
  docker-compose up -d postgres rabbitmq consul
  
  # Wait for services to be healthy
  echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
  sleep 10
  
  # Check if services are healthy
  if docker-compose ps | grep -q "postgres.*running" && \
     docker-compose ps | grep -q "rabbitmq.*running" && \
     docker-compose ps | grep -q "consul.*running"; then
    echo -e "${GREEN}Infrastructure services are running.${NC}"
  else
    echo -e "${RED}Some services failed to start. Check docker-compose logs for more details.${NC}"
    exit 1
  fi
  
  # Start application services
  echo -e "${YELLOW}Starting application services (Auth Service, API Gateway)...${NC}"
  docker-compose up -d auth api-gateway
  
  # Wait for application services to be ready
  echo -e "${YELLOW}Waiting for application services to start...${NC}"
  sleep 10
  
  # Start web application
  echo -e "${YELLOW}Starting web application...${NC}"
  docker-compose up -d web
  
  echo -e "${GREEN}====================================================${NC}"
  echo -e "${GREEN}Qbit development environment is now running!${NC}"
  echo -e "${GREEN}====================================================${NC}"
  echo -e "${GREEN}Services available:${NC}"
  echo -e "${GREEN}- Web App: http://localhost:3001${NC}"
  echo -e "${GREEN}- API Gateway: http://localhost:3000${NC}"
  echo -e "${GREEN}- Auth Service: http://localhost:3002${NC}"
  echo -e "${GREEN}- RabbitMQ Management: http://localhost:15672${NC}"
  echo -e "${GREEN}  Username: qbit${NC}"
  echo -e "${GREEN}  Password: qbit_password${NC}"
  echo -e "${GREEN}- Consul UI: http://localhost:8500${NC}"
  echo -e "${GREEN}- PgAdmin: http://localhost:5050${NC}"
  echo -e "${GREEN}  Email: admin@qbit.com${NC}"
  echo -e "${GREEN}  Password: admin123${NC}"
  echo -e "${GREEN}====================================================${NC}"
}

# Function to display help
show_help() {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  --start       Start all services (default if no option provided)"
  echo "  --stop        Stop all services"
  echo "  --restart     Restart all services"
  echo "  --status      Show status of all services"
  echo "  --logs        Show logs from all services"
  echo "  --help        Show this help message"
}

# Process command line arguments
if [ $# -eq 0 ]; then
  ACTION="start"
else
  case "$1" in
    --start)
      ACTION="start"
      ;;
    --stop)
      ACTION="stop"
      ;;
    --restart)
      ACTION="restart"
      ;;
    --status)
      ACTION="status"
      ;;
    --logs)
      ACTION="logs"
      ;;
    --help)
      show_help
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      show_help
      exit 1
      ;;
  esac
fi

# Execute the requested action
case "$ACTION" in
  start)
    check_docker
    check_docker_compose
    setup_environment
    ;;
  stop)
    echo -e "${YELLOW}Stopping all services...${NC}"
    docker-compose down
    echo -e "${GREEN}All services stopped.${NC}"
    ;;
  restart)
    echo -e "${YELLOW}Restarting all services...${NC}"
    docker-compose down
    check_docker
    check_docker_compose
    setup_environment
    ;;
  status)
    echo -e "${YELLOW}Current status of services:${NC}"
    docker-compose ps
    ;;
  logs)
    echo -e "${YELLOW}Showing logs from all services:${NC}"
    docker-compose logs --tail=100
    ;;
esac

exit 0 