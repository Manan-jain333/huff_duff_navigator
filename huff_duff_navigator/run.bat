@echo off
echo 🧭 Starting Huff-Duff: The Bennett Navigator...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python first.
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
pip install -r requirements.txt --quiet

REM Run the application
echo.
echo ✅ Starting Flask server...
echo 🌐 Open your browser and navigate to: http://localhost:5000
echo 🛑 Press Ctrl+C to stop the server
echo.

python app.py

pause

