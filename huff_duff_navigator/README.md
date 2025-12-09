# Huff-Duff: The Bennett Navigator

An interactive navigation system for Bennett University that helps students and employees locate classes efficiently using user-friendly maps, reducing delays and confusion.

## Features

- **User Authentication**: Login with name and enrollment number (password is last 4 digits)
- **Block Selection**: Choose from blocks A, B, N, or P
- **Smart Navigation**: Find shortest path using Dijkstra's algorithm
- **Route Preferences**: Choose between lift or stairs
- **Interactive Maps**: Visual representation of navigation paths
- **Responsive Design**: Works on desktop and mobile devices

## Installation

### Quick Start (Recommended)

**For macOS/Linux:**
```bash
cd huff_duff_navigator
./run.sh
```

**For Windows:**
```bash
cd huff_duff_navigator
run.bat
```

### Manual Installation

1. **Navigate to the project directory:**
   ```bash
   cd huff_duff_navigator
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application:**
   ```bash
   python app.py
   ```

5. **Access the application:**
   Open your browser and navigate to: `http://localhost:5000`

## Usage

### Login
- Enter your full name
- Enter your enrollment number (e.g., E22CSEU1199)
- Enter password (last 4 digits of enrollment number, e.g., 1199)

### Navigation
1. Select your target block (A, B, N, or P)
2. Enter the classroom number (e.g., B-202, A-301)
3. Choose your preferred route (Lift or Stairs)
4. Click "Find Path" to get directions

## Default Users

For testing purposes, the following users are pre-configured:

- **Student**: 
  - Enrollment: E22CSEU1199
  - Name: Manan Jain
  - Password: 1199

- **Student**: 
  - Enrollment: E22CSEU1200
  - Name: Jane Smith
  - Password: 1200

- **Employee**: 
  - Enrollment: EMP001
  - Name: Dr. Sharma
  - Password: 0001

## Technology Stack

- **Backend**: Python (Flask)
- **Frontend**: HTML, CSS, JavaScript
- **Algorithm**: Dijkstra's shortest path algorithm
- **Design**: Responsive UI/UX

## Project Structure

```
huff_duff_navigator/
├── app.py                 # Flask backend application
├── templates/
│   └── index.html        # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css     # Styling
│   └── js/
│       └── app.js        # Frontend JavaScript
├── requirements.txt       # Python dependencies
└── README.md            # This file
```

## Algorithm

The navigation system uses **Dijkstra's algorithm** to find the shortest path from the block entrance to the target classroom. The algorithm considers:
- Distance between nodes
- User preference (lift vs stairs)
- Floor transitions
- Inter-block movements

## Future Enhancements

- Real-time location tracking
- Integration with actual building floor plans
- Multiple route options
- Estimated time to destination
- Accessibility features
- Database integration for user management

## License

This project is developed for Bennett University navigation purposes.

