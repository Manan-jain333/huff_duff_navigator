#!/bin/bash

# Huff-Duff Navigator Startup Script

echo "🧭 Starting Huff-Duff: The Bennett Navigator..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt --quiet

# Run the application
echo ""
echo "✅ Starting Flask server..."
echo "🌐 Open your browser and navigate to: http://localhost:5000"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

python app.py

