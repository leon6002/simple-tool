#!/bin/bash

# SimpleTool Deployment Script
# Usage: ./deploy.sh [option]
# Options:
#   build   - Build Docker image
#   start   - Start containers
#   stop    - Stop containers
#   restart - Restart containers
#   logs    - Show logs
#   update  - Pull latest code and rebuild

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_success "Docker is installed"
}

# Check if Docker Compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_success "Docker Compose is installed"
}

# Build Docker image
build() {
    print_info "Building Docker image..."
    docker-compose build
    print_success "Docker image built successfully"
}

# Start containers
start() {
    print_info "Starting containers..."
    docker-compose up -d
    print_success "Containers started successfully"
    print_info "Application is running at http://localhost:3000"
}

# Stop containers
stop() {
    print_info "Stopping containers..."
    docker-compose down
    print_success "Containers stopped successfully"
}

# Restart containers
restart() {
    print_info "Restarting containers..."
    docker-compose restart
    print_success "Containers restarted successfully"
}

# Show logs
logs() {
    print_info "Showing logs (Press Ctrl+C to exit)..."
    docker-compose logs -f
}

# Update application
update() {
    print_info "Updating application..."
    
    # Pull latest code
    print_info "Pulling latest code from git..."
    git pull
    
    # Rebuild image
    print_info "Rebuilding Docker image..."
    docker-compose build
    
    # Restart containers
    print_info "Restarting containers..."
    docker-compose up -d
    
    print_success "Application updated successfully"
}

# Main script
main() {
    check_docker
    check_docker_compose
    
    case "$1" in
        build)
            build
            ;;
        start)
            start
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        logs)
            logs
            ;;
        update)
            update
            ;;
        *)
            echo "Usage: $0 {build|start|stop|restart|logs|update}"
            echo ""
            echo "Options:"
            echo "  build   - Build Docker image"
            echo "  start   - Start containers"
            echo "  stop    - Stop containers"
            echo "  restart - Restart containers"
            echo "  logs    - Show logs"
            echo "  update  - Pull latest code and rebuild"
            exit 1
            ;;
    esac
}

main "$@"

