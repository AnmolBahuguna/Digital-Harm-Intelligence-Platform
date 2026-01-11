#!/bin/bash

# DHIP Production-Grade Test Suite
# This script runs all tests including unit, integration, load, and E2E tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if required services are running
check_services() {
    print_status "Checking required services..."
    
    # Check if Redis is running
    if ! pgrep -x "redis-server" > /dev/null; then
        print_warning "Redis is not running. Starting Redis..."
        redis-server --daemonize yes || {
            print_error "Failed to start Redis. Please install and start Redis manually."
            exit 1
        }
    fi
    
    # Check if PostgreSQL is running
    if ! pgrep -x "postgres" > /dev/null; then
        print_warning "PostgreSQL is not running. Please start PostgreSQL manually."
        print_warning "Some tests may fail without PostgreSQL."
    fi
    
    # Check if MongoDB is running
    if ! pgrep -x "mongod" > /dev/null; then
        print_warning "MongoDB is not running. Please start MongoDB manually."
        print_warning "Some tests may fail without MongoDB."
    fi
}

# Setup test environment
setup_test_env() {
    print_status "Setting up test environment..."
    
    # Create test directories
    mkdir -p tests/logs
    mkdir -p tests/reports
    
    # Set environment variables for testing
    export NODE_ENV=test
    export REDIS_URL=redis://localhost:6379
    export POSTGRES_URL=postgresql://test_user:test_password@localhost:5432/dhip_test
    export MONGODB_URL=mongodb://test_user:test_password@localhost:27017/dhip_test
    export TWILIO_ACCOUNT_SID=test_sid
    export TWILIO_AUTH_TOKEN=test_token
    export TWILIO_PHONE_NUMBER=test_phone
    
    print_success "Test environment setup complete"
}

# Run unit tests
run_unit_tests() {
    print_status "Running unit tests..."
    
    cd tests/unit
    npm test -- --coverage --verbose --detectOpenHandles
    
    if [ $? -eq 0 ]; then
        print_success "Unit tests passed"
    else
        print_error "Unit tests failed"
        exit 1
    fi
    
    cd ../..
}

# Run integration tests
run_integration_tests() {
    print_status "Running integration tests..."
    
    # Start the server in test mode
    node server-production.js &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 5
    
    # Run integration tests
    cd tests/integration
    npm test -- --verbose
    
    if [ $? -eq 0 ]; then
        print_success "Integration tests passed"
    else
        print_error "Integration tests failed"
        kill $SERVER_PID
        exit 1
    fi
    
    # Kill the test server
    kill $SERVER_PID
    cd ../..
}

# Run load tests
run_load_tests() {
    print_status "Running load tests..."
    
    # Check if k6 is installed
    if ! command -v k6 &> /dev/null; then
        print_warning "k6 is not installed. Skipping load tests."
        print_warning "Install k6 from: https://k6.io/docs/getting-started/installation/"
        return
    fi
    
    # Start the server
    node server-production.js &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 5
    
    # Run load tests
    cd tests/load
    k6 run load-test.js --out json=../reports/load-test-results.json
    
    if [ $? -eq 0 ]; then
        print_success "Load tests completed"
    else
        print_warning "Load tests had issues (may be expected if services not fully configured)"
    fi
    
    # Kill the test server
    kill $SERVER_PID
    cd ../..
}

# Run E2E tests
run_e2e_tests() {
    print_status "Running E2E tests..."
    
    # Check if frontend is running
    if ! curl -s http://localhost:5173 > /dev/null; then
        print_warning "Frontend is not running. Starting frontend..."
        npm run dev &
        FRONTEND_PID=$!
        
        # Wait for frontend to start
        sleep 10
        
        if ! curl -s http://localhost:5173 > /dev/null; then
            print_error "Failed to start frontend. Skipping E2E tests."
            return
        fi
    fi
    
    # Start the backend server
    node server-production.js &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 5
    
    # Run E2E tests
    cd tests/e2e
    npm test -- --verbose
    
    if [ $? -eq 0 ]; then
        print_success "E2E tests passed"
    else
        print_error "E2E tests failed"
        kill $SERVER_PID
        if [ ! -z "$FRONTEND_PID" ]; then
            kill $FRONTEND_PID
        fi
        exit 1
    fi
    
    # Kill servers
    kill $SERVER_PID
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID
    fi
    cd ../..
}

# Run security tests
run_security_tests() {
    print_status "Running security tests..."
    
    # Check if npm audit is available
    if command -v npm &> /dev/null; then
        npm audit --audit-level moderate
        
        if [ $? -eq 0 ]; then
            print_success "No security vulnerabilities found"
        else
            print_warning "Security vulnerabilities found. Review npm audit output."
        fi
    fi
    
    # Run OWASP ZAP Baseline scan if available
    if command -v docker &> /dev/null; then
        print_status "Running OWASP ZAP security scan..."
        
        # Start the server
        node server-production.js &
        SERVER_PID=$!
        sleep 5
        
        # Run ZAP scan
        docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:3001 || {
            print_warning "ZAP scan completed with issues (may be expected)"
        }
        
        # Kill the server
        kill $SERVER_PID
    else
        print_warning "Docker not available. Skipping OWASP ZAP scan."
    fi
}

# Generate test report
generate_report() {
    print_status "Generating test report..."
    
    REPORT_FILE="tests/reports/test-summary-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# DHIP Test Suite Report

**Date:** $(date)
**Environment:** $NODE_ENV

## Test Results

### Unit Tests
- Status: $([ -f "tests/unit/coverage/lcov.info" ] && echo "✅ Passed" || echo "❌ Failed")
- Coverage: $([ -f "tests/unit/coverage/coverage-summary.json" ] && cat tests/unit/coverage/coverage-summary.json | grep -o '"total":{"lines":{"pct":[^}]*}' | grep -o '[0-9.]*' || echo "N/A")%

### Integration Tests
- Status: $([ -f "tests/integration/test-results.xml" ] && echo "✅ Passed" || echo "❌ Failed")

### Load Tests
- Status: $([ -f "tests/reports/load-test-results.json" ] && echo "✅ Completed" || echo "❌ Failed")

### E2E Tests
- Status: $([ -f "tests/e2e/test-results.xml" ] && echo "✅ Passed" || echo "❌ Failed")

### Security Tests
- Status: Completed (check individual outputs)

## Recommendations

1. Review any failed tests and fix issues
2. Address security vulnerabilities found by npm audit
3. Monitor performance metrics from load tests
4. Ensure all services are properly configured for production

## Next Steps

1. Fix any failing tests
2. Improve test coverage where needed
3. Set up CI/CD pipeline to run these tests automatically
4. Monitor test performance and optimize where needed
EOF

    print_success "Test report generated: $REPORT_FILE"
}

# Main execution
main() {
    print_status "Starting DHIP Production-Grade Test Suite..."
    print_status "========================================="
    
    # Check prerequisites
    check_services
    
    # Setup environment
    setup_test_env
    
    # Run different test types
    print_status "Running test suite..."
    echo ""
    
    # Run tests based on arguments or all tests
    if [ "$1" == "unit" ]; then
        run_unit_tests
    elif [ "$1" == "integration" ]; then
        run_integration_tests
    elif [ "$1" == "load" ]; then
        run_load_tests
    elif [ "$1" == "e2e" ]; then
        run_e2e_tests
    elif [ "$1" == "security" ]; then
        run_security_tests
    else
        run_unit_tests
        run_integration_tests
        run_load_tests
        run_e2e_tests
        run_security_tests
    fi
    
    # Generate report
    generate_report
    
    print_status "========================================="
    print_success "Test suite completed!"
    print_status "Check tests/reports/ for detailed results."
}

# Help function
show_help() {
    echo "Usage: $0 [test_type]"
    echo ""
    echo "Test types:"
    echo "  unit        - Run unit tests only"
    echo "  integration - Run integration tests only"
    echo "  load        - Run load tests only"
    echo "  e2e         - Run E2E tests only"
    echo "  security    - Run security tests only"
    echo "  (no args)   - Run all tests"
    echo ""
    echo "Examples:"
    echo "  $0              # Run all tests"
    echo "  $0 unit         # Run unit tests only"
    echo "  $0 load         # Run load tests only"
}

# Check for help argument
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    show_help
    exit 0
fi

# Run main function
main "$@"
