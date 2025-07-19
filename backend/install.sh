#!/bin/bash

# SocialDownloader Installation Script
# This script sets up the Social Media Downloader on your system

echo "🚀 SocialDownloader Installation Script"
echo "========================================"

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_warning "This script should not be run as root for security reasons."
   echo "Please run as a regular user."
   exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check system requirements
print_status "Checking system requirements..."

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    print_success "Node.js found: v$NODE_VERSION"
    
    # Check if version is >= 14.0.0
    if [[ $(echo "$NODE_VERSION 14.0.0" | tr " " "\n" | sort -V | head -n1) == "14.0.0" ]]; then
        print_success "Node.js version is compatible"
    else
        print_error "Node.js version must be 14.0.0 or higher"
        print_status "Please update Node.js: https://nodejs.org/"
        exit 1
    fi
else
    print_error "Node.js not found"
    print_status "Please install Node.js: https://nodejs.org/"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm found: v$NPM_VERSION"
else
    print_error "npm not found"
    print_status "npm should be installed with Node.js"
    exit 1
fi

# Check Python
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_success "Python found: v$PYTHON_VERSION"
else
    print_error "Python 3 not found"
    print_status "Please install Python 3: https://python.org/"
    exit 1
fi

# Check pip
if command_exists pip3; then
    PIP_VERSION=$(pip3 --version | cut -d' ' -f2)
    print_success "pip found: v$PIP_VERSION"
else
    print_error "pip3 not found"
    print_status "Please install pip3"
    exit 1
fi

print_success "All system requirements met!"
echo ""

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend

if npm install; then
    print_success "Backend dependencies installed successfully"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

echo ""

# Install yt-dlp
print_status "Installing yt-dlp..."
if pip3 install --user yt-dlp; then
    print_success "yt-dlp installed successfully"
else
    print_error "Failed to install yt-dlp"
    print_status "Trying with sudo..."
    if sudo pip3 install yt-dlp; then
        print_success "yt-dlp installed successfully with sudo"
    else
        print_error "Failed to install yt-dlp"
        exit 1
    fi
fi

echo ""

# Check yt-dlp installation
if command_exists yt-dlp; then
    YTDLP_VERSION=$(yt-dlp --version)
    print_success "yt-dlp is working: v$YTDLP_VERSION"
else
    print_warning "yt-dlp command not found in PATH"
    print_status "You may need to add ~/.local/bin to your PATH"
    echo "Add this to your ~/.bashrc or ~/.zshrc:"
    echo "export PATH=\"\$HOME/.local/bin:\$PATH\""
fi

echo ""

# Create startup script
print_status "Creating startup script..."
cat > start.sh << 'EOF'
#!/bin/bash

# SocialDownloader Startup Script

echo "🚀 Starting SocialDownloader..."

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: server.js not found"
    echo "Please run this script from the backend directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo "🌐 Starting server on http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

node server.js
EOF

chmod +x start.sh
print_success "Startup script created: start.sh"

echo ""

# Create development script
print_status "Creating development script..."
cat > dev.sh << 'EOF'
#!/bin/bash

# SocialDownloader Development Script

echo "🔧 Starting SocialDownloader in development mode..."

# Install nodemon if not present
if ! command -v nodemon >/dev/null 2>&1; then
    echo "📦 Installing nodemon for development..."
    npm install -g nodemon
fi

# Start with nodemon for auto-restart
echo "🌐 Starting development server on http://localhost:3000"
echo "Server will auto-restart on file changes"
echo "Press Ctrl+C to stop the server"
echo ""

nodemon server.js
EOF

chmod +x dev.sh
print_success "Development script created: dev.sh"

echo ""

# Create stop script
print_status "Creating stop script..."
cat > stop.sh << 'EOF'
#!/bin/bash

# SocialDownloader Stop Script

echo "🛑 Stopping SocialDownloader..."

# Find and kill node processes running server.js
PIDS=$(ps aux | grep "node.*server.js" | grep -v grep | awk '{print $2}')

if [ -z "$PIDS" ]; then
    echo "ℹ️  No SocialDownloader processes found"
else
    echo "🔍 Found processes: $PIDS"
    for PID in $PIDS; do
        echo "🛑 Stopping process $PID"
        kill $PID
    done
    echo "✅ SocialDownloader stopped"
fi
EOF

chmod +x stop.sh
print_success "Stop script created: stop.sh"

echo ""

# Installation complete
print_success "🎉 Installation completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start the server:"
echo "   ./start.sh"
echo ""
echo "2. Open your browser and go to:"
echo "   http://localhost:3000"
echo ""
echo "3. For development (auto-restart):"
echo "   ./dev.sh"
echo ""
echo "4. To stop the server:"
echo "   ./stop.sh"
echo ""
echo "📚 Documentation:"
echo "   - Main README: ../README.md"
echo "   - Backend README: README.md"
echo "   - API Documentation: Check README files"
echo ""
echo "🆘 Need help?"
echo "   - Check the troubleshooting section in README.md"
echo "   - Ensure all URLs are publicly accessible"
echo "   - Some platforms may require authentication"
echo ""
print_success "Happy downloading! 🎬📱"

