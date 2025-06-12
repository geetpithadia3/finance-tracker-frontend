#!/bin/bash

# Netlify Deployment Script for Cove Finance Tracker
# This script automates the deployment process to Netlify

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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18.0 or higher"
        exit 1
    fi
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Are you in the correct directory?"
        exit 1
    fi
    
    # Check if this is the correct project
    if ! grep -q '"name": "Cove"' package.json; then
        print_error "This doesn't appear to be the Cove frontend project"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Install Netlify CLI if not present
setup_netlify_cli() {
    if ! command_exists netlify; then
        print_status "Installing Netlify CLI..."
        npm install -g netlify-cli
        
        if [ $? -eq 0 ]; then
            print_success "Netlify CLI installed successfully"
        else
            print_error "Failed to install Netlify CLI"
            exit 1
        fi
    else
        print_success "Netlify CLI is already installed"
    fi
}

# Login to Netlify
netlify_login() {
    print_status "Checking Netlify authentication..."
    
    if netlify status >/dev/null 2>&1; then
        print_success "Already logged into Netlify"
    else
        print_status "Logging into Netlify..."
        netlify login
        
        if [ $? -eq 0 ]; then
            print_success "Successfully logged into Netlify"
        else
            print_error "Failed to login to Netlify"
            exit 1
        fi
    fi
}

# Run pre-deployment checks
run_pre_deployment_checks() {
    print_status "Running pre-deployment checks..."
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm ci
    
    # Run type checking
    print_status "Running TypeScript type checking..."
    npm run type-check
    
    if [ $? -ne 0 ]; then
        print_error "TypeScript type checking failed"
        exit 1
    fi
    
    # Run linting
    print_status "Running ESLint..."
    npm run lint
    
    if [ $? -ne 0 ]; then
        print_warning "Linting issues found. Attempting to fix..."
        npm run lint:fix
        
        # Run lint again to check if issues are resolved
        npm run lint
        if [ $? -ne 0 ]; then
            print_error "Linting issues could not be automatically fixed"
            exit 1
        fi
    fi
    
    # Run security audit
    print_status "Running security audit..."
    npm audit --audit-level=high
    
    if [ $? -ne 0 ]; then
        print_warning "Security audit found issues. Consider running 'npm audit fix'"
    fi
    
    print_success "Pre-deployment checks passed"
}

# Build the project
build_project() {
    print_status "Building project for production..."
    
    # Clean previous build
    if [ -d "dist" ]; then
        rm -rf dist
        print_status "Cleaned previous build"
    fi
    
    # Build for production
    npm run build:prod
    
    if [ $? -eq 0 ]; then
        print_success "Project built successfully"
    else
        print_error "Build failed"
        exit 1
    fi
    
    # Verify build output
    if [ ! -d "dist" ]; then
        print_error "Build output directory 'dist' not found"
        exit 1
    fi
    
    if [ ! -f "dist/index.html" ]; then
        print_error "Build output does not contain index.html"
        exit 1
    fi
    
    print_success "Build output verified"
}

# Deploy to Netlify
deploy_to_netlify() {
    local deployment_type="$1"
    
    if [ "$deployment_type" = "prod" ]; then
        print_status "Deploying to production..."
        netlify deploy --prod --dir=dist
    else
        print_status "Creating draft deployment..."
        netlify deploy --dir=dist
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Deployment completed successfully"
    else
        print_error "Deployment failed"
        exit 1
    fi
}

# Create or update site
setup_netlify_site() {
    print_status "Checking Netlify site configuration..."
    
    if [ ! -f ".netlify/state.json" ]; then
        print_status "No existing site configuration found. Creating new site..."
        
        # Create new site
        netlify init
        
        if [ $? -eq 0 ]; then
            print_success "Netlify site created and configured"
        else
            print_error "Failed to create Netlify site"
            exit 1
        fi
    else
        print_success "Existing Netlify site configuration found"
        
        # Show site info
        netlify status
    fi
}

# Set environment variables
configure_environment() {
    print_status "Checking environment configuration..."
    
    if [ -f ".env.production" ]; then
        print_warning "Remember to set these environment variables in Netlify Dashboard:"
        echo ""
        grep "^VITE_" .env.production | while read line; do
            var_name=$(echo $line | cut -d'=' -f1)
            echo "  - $var_name"
        done
        echo ""
        print_warning "Go to Site settings → Environment variables in Netlify Dashboard"
    else
        print_warning ".env.production file not found. Create one based on .env.example"
    fi
}

# Validate deployment
validate_deployment() {
    print_status "Validating deployment..."
    
    # Get site URL
    site_url=$(netlify status --json | jq -r '.site.url' 2>/dev/null)
    
    if [ "$site_url" != "null" ] && [ ! -z "$site_url" ]; then
        print_success "Site is live at: $site_url"
        
        # Test if site is accessible
        if command_exists curl; then
            if curl -s -f "$site_url" >/dev/null; then
                print_success "Site is accessible and responding"
            else
                print_warning "Site URL might not be ready yet. Please check manually."
            fi
        fi
    else
        print_warning "Could not retrieve site URL. Check Netlify dashboard."
    fi
}

# Main deployment function
main() {
    echo ""
    echo "======================================================="
    echo "   Cove Finance Tracker - Netlify Deployment Script"
    echo "======================================================="
    echo ""
    
    # Parse command line arguments
    local deployment_type="draft"
    local skip_checks=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --prod|--production)
                deployment_type="prod"
                shift
                ;;
            --skip-checks)
                skip_checks=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --prod, --production    Deploy to production (default: draft)"
                echo "  --skip-checks          Skip pre-deployment checks"
                echo "  --help, -h             Show this help message"
                echo ""
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run deployment steps
    check_prerequisites
    setup_netlify_cli
    netlify_login
    setup_netlify_site
    
    if [ "$skip_checks" = false ]; then
        run_pre_deployment_checks
    else
        print_warning "Skipping pre-deployment checks"
    fi
    
    build_project
    configure_environment
    deploy_to_netlify "$deployment_type"
    validate_deployment
    
    echo ""
    echo "======================================================="
    echo "              Deployment Complete!"
    echo "======================================================="
    echo ""
    
    if [ "$deployment_type" = "prod" ]; then
        print_success "🎉 Your Cove Finance Tracker is now live in production!"
    else
        print_success "🚀 Draft deployment created successfully!"
        print_status "Run with --prod flag to deploy to production"
    fi
    
    echo ""
    echo "Next steps:"
    echo "  1. Test your deployed application thoroughly"
    echo "  2. Set up environment variables in Netlify Dashboard"
    echo "  3. Configure your custom domain (if needed)"
    echo "  4. Set up monitoring and analytics"
    echo ""
    echo "For more information, see NETLIFY_DEPLOYMENT.md"
    echo ""
}

# Run main function with all arguments
main "$@"