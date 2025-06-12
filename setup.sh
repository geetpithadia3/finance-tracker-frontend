#!/bin/bash

# Cove Finance Tracker Frontend Setup Script
# This script helps set up the development environment for the Cove Finance Tracker frontend

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js version
check_node_version() {
    if command_exists node; then
        node_version=$(node --version | cut -d'v' -f2)
        major_version=$(echo $node_version | cut -d'.' -f1)
        
        if [ "$major_version" -ge 18 ]; then
            print_success "Node.js version $node_version is compatible"
            return 0
        else
            print_error "Node.js version $node_version is not supported. Please install Node.js 18.0 or higher"
            return 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18.0 or higher"
        return 1
    fi
}

# Check npm version
check_npm_version() {
    if command_exists npm; then
        npm_version=$(npm --version)
        print_success "npm version $npm_version is available"
        return 0
    else
        print_error "npm is not installed. Please install npm"
        return 1
    fi
}

# Check if backend is running
check_backend() {
    print_status "Checking if backend is running on http://localhost:8080..."
    
    if command_exists curl; then
        if curl -s -f http://localhost:8080/health >/dev/null 2>&1; then
            print_success "Backend is running and accessible"
            return 0
        else
            print_warning "Backend is not running on http://localhost:8080"
            print_warning "Please start the backend server before running the frontend"
            return 1
        fi
    else
        print_warning "curl is not available, skipping backend check"
        return 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Dependencies installed successfully"
        return 0
    else
        print_error "Failed to install dependencies"
        return 1
    fi
}

# Run security audit
run_security_audit() {
    print_status "Running security audit..."
    
    npm audit --audit-level=high
    
    if [ $? -eq 0 ]; then
        print_success "Security audit passed"
    else
        print_warning "Security audit found issues. Run 'npm audit fix' to resolve them"
    fi
}

# Run type checking
run_type_check() {
    print_status "Running TypeScript type checking..."
    
    npm run type-check
    
    if [ $? -eq 0 ]; then
        print_success "TypeScript type checking passed"
        return 0
    else
        print_error "TypeScript type checking failed"
        return 1
    fi
}

# Run linting
run_linting() {
    print_status "Running ESLint..."
    
    npm run lint
    
    if [ $? -eq 0 ]; then
        print_success "Linting passed"
        return 0
    else
        print_warning "Linting issues found. Run 'npm run lint:fix' to auto-fix some issues"
        return 1
    fi
}

# Setup git hooks
setup_git_hooks() {
    if [ -d ".git" ]; then
        print_status "Setting up git hooks with Husky..."
        npm run prepare
        print_success "Git hooks configured"
    else
        print_warning "Not a git repository, skipping git hooks setup"
    fi
}

# Create environment file
create_env_file() {
    if [ ! -f ".env" ]; then
        print_status "Creating .env file..."
        
        cat > .env << EOF
# Development Environment Configuration
VITE_APP_NAME=Cove
VITE_API_BASE_URL=http://localhost:8080
VITE_NODE_ENV=development

# Optional: Enable detailed debugging
# VITE_DEBUG=true

# Optional: Configure theme
# VITE_DEFAULT_THEME=light
EOF
        
        print_success ".env file created with default configuration"
    else
        print_warning ".env file already exists, skipping creation"
    fi
}

# Main setup function
main() {
    echo ""
    echo "=================================================="
    echo "   Cove Finance Tracker Frontend Setup Script"
    echo "=================================================="
    echo ""
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    
    if ! check_node_version; then
        exit 1
    fi
    
    if ! check_npm_version; then
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Are you in the frontend project directory?"
        exit 1
    fi
    
    # Verify this is the correct project
    if ! grep -q '"name": "Cove"' package.json; then
        print_error "This doesn't appear to be the Cove frontend project"
        exit 1
    fi
    
    print_success "Prerequisites check completed"
    echo ""
    
    # Install dependencies
    install_dependencies
    echo ""
    
    # Create environment file
    create_env_file
    echo ""
    
    # Setup git hooks
    setup_git_hooks
    echo ""
    
    # Run security audit
    run_security_audit
    echo ""
    
    # Run type checking
    run_type_check
    echo ""
    
    # Run linting
    run_linting
    echo ""
    
    # Check backend
    check_backend
    echo ""
    
    # Final instructions
    echo "=================================================="
    echo "              Setup Complete!"
    echo "=================================================="
    echo ""
    print_success "The Cove Finance Tracker frontend is ready for development!"
    echo ""
    echo "Next steps:"
    echo "  1. Start the development server: ${GREEN}npm run dev${NC}"
    echo "  2. Open your browser to: ${BLUE}http://localhost:3000${NC}"
    echo ""
    
    if ! curl -s -f http://localhost:8080/health >/dev/null 2>&1; then
        echo "Backend setup:"
        echo "  1. Make sure the backend is running on port 8080"
        echo "  2. Check the backend README for setup instructions"
        echo ""
    fi
    
    echo "Available commands:"
    echo "  ${GREEN}npm run dev${NC}        - Start development server"
    echo "  ${GREEN}npm run build${NC}      - Build for production"
    echo "  ${GREEN}npm run preview${NC}    - Preview production build"
    echo "  ${GREEN}npm run lint${NC}       - Check code quality"
    echo "  ${GREEN}npm run test${NC}       - Run tests"
    echo ""
    echo "For more information, see README.md"
    echo ""
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Cove Finance Tracker Frontend Setup Script"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h       Show this help message"
        echo "  --quick, -q      Quick setup (skip optional checks)"
        echo "  --check-only     Only run checks, don't install anything"
        echo ""
        echo "This script will:"
        echo "  - Check Node.js and npm versions"
        echo "  - Install project dependencies"
        echo "  - Create environment configuration"
        echo "  - Setup git hooks"
        echo "  - Run code quality checks"
        echo "  - Verify backend connectivity"
        exit 0
        ;;
    --quick|-q)
        print_status "Running quick setup..."
        check_node_version && check_npm_version && install_dependencies && create_env_file
        print_success "Quick setup completed!"
        ;;
    --check-only)
        print_status "Running checks only..."
        check_node_version && check_npm_version && check_backend && run_type_check && run_linting
        ;;
    *)
        main
        ;;
esac