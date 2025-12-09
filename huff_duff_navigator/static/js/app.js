// Check authentication status on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});

let currentUserType = null;

async function checkAuth() {
    try {
        const response = await fetch('/check-auth');
        const data = await response.json();
        
        if (data.authenticated) {
            currentUserType = data.user_type;
            showNavScreen(data.user_name, data.user_type);
        } else {
            showLoginScreen();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        showLoginScreen();
    }
}

function showLoginScreen() {
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('nav-screen').classList.remove('active');
}

function showNavScreen(userName, userType) {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('nav-screen').classList.add('active');
    document.getElementById('user-name').textContent = userName || 'User';
    
    const adminBtn = document.getElementById('admin-dashboard-btn');
    const adminDashboard = document.getElementById('admin-dashboard');
    const navContent = document.querySelector('.nav-content');
    
    // Always ensure admin dashboard is hidden by default and force hide with inline style
    adminDashboard.classList.add('hidden');
    adminDashboard.style.display = 'none';
    
    // Always show nav content by default
    navContent.classList.remove('hidden');
    navContent.style.display = 'block';
    
    // Show admin dashboard button ONLY if user is admin
    if (userType === 'admin') {
        adminBtn.classList.remove('hidden');
        adminBtn.style.display = 'inline-block';
        currentUserType = 'admin';
        // Ensure dashboard is hidden initially (will be shown when button is clicked)
        adminDashboard.classList.add('hidden');
        adminDashboard.style.display = 'none';
    } else {
        // For non-admin users, completely hide admin button and dashboard
        adminBtn.classList.add('hidden');
        adminBtn.style.display = 'none';
        adminDashboard.classList.add('hidden');
        adminDashboard.style.display = 'none';
        currentUserType = userType;
    }
}

// Auth tab toggle
document.getElementById('login-tab').addEventListener('click', function() {
    document.getElementById('login-tab').classList.add('active');
    document.getElementById('signup-tab').classList.remove('active');
    document.getElementById('login-form').classList.add('active');
    document.getElementById('signup-form').classList.remove('active');
    document.getElementById('login-error').classList.remove('show');
    document.getElementById('signup-error').classList.remove('show');
    document.getElementById('login-error').textContent = '';
    document.getElementById('signup-error').textContent = '';
});

document.getElementById('signup-tab').addEventListener('click', function() {
    document.getElementById('signup-tab').classList.add('active');
    document.getElementById('login-tab').classList.remove('active');
    document.getElementById('signup-form').classList.add('active');
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('login-error').classList.remove('show');
    document.getElementById('signup-error').classList.remove('show');
    document.getElementById('login-error').textContent = '';
    document.getElementById('signup-error').textContent = '';
});

// Login form handler
document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const enrollment_no = document.getElementById('enrollment_no').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    
    errorDiv.classList.remove('show');
    errorDiv.textContent = '';
    
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, enrollment_no, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            currentUserType = data.user_type;
            showNavScreen(data.message.split(' ')[1], data.user_type); // Extract name from welcome message
            document.getElementById('login-form').reset();
        } else {
            errorDiv.textContent = data.error || 'Login failed. Please try again.';
            errorDiv.classList.add('show');
        }
    } catch (error) {
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.classList.add('show');
    }
});

// Sign up form handler
document.getElementById('signup-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const enrollment_no = document.getElementById('signup-enrollment_no').value;
    const password = document.getElementById('signup-password').value;
    const user_type = 'student'; // Default to student for now
    const errorDiv = document.getElementById('signup-error');
    
    errorDiv.classList.remove('show');
    errorDiv.textContent = '';
    
    // Validate password is exactly 4 digits
    if (password.length !== 4 || !/^\d{4}$/.test(password)) {
        errorDiv.textContent = 'Password must be exactly 4 digits';
        errorDiv.classList.add('show');
        return;
    }
    
    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, enrollment_no, password, user_type })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Extract name from welcome message (e.g., "Welcome Manan Jain!" -> "Manan Jain")
            const nameMatch = data.message.match(/Welcome (.+)!/);
            const userName = nameMatch ? nameMatch[1] : name;
            currentUserType = data.user_type;
            showNavScreen(userName, data.user_type);
            document.getElementById('signup-form').reset();
        } else {
            errorDiv.textContent = data.error || 'Sign up failed. Please try again.';
            errorDiv.classList.add('show');
        }
    } catch (error) {
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.classList.add('show');
    }
});

// Logout handler
document.getElementById('logout-btn').addEventListener('click', async function() {
    try {
        const response = await fetch('/logout', {
            method: 'POST'
        });
        
        const data = await response.json();
        if (data.success) {
            currentUserType = null;
            showLoginScreen();
            document.getElementById('path-result').classList.add('hidden');
            document.getElementById('admin-dashboard').classList.add('hidden');
            document.querySelector('.nav-content').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Logout failed:', error);
    }
});

// Admin Dashboard handler
document.getElementById('admin-dashboard-btn').addEventListener('click', async function() {
    // Only allow admin users to access dashboard
    if (currentUserType !== 'admin') {
        return;
    }
    
    const adminDashboard = document.getElementById('admin-dashboard');
    const navContent = document.querySelector('.nav-content');
    
    if (adminDashboard.classList.contains('hidden')) {
        // Show admin dashboard
        adminDashboard.classList.remove('hidden');
        adminDashboard.style.display = 'block';
        navContent.classList.add('hidden');
        navContent.style.display = 'none';
        loadAdminData();
    } else {
        // Hide admin dashboard
        adminDashboard.classList.add('hidden');
        adminDashboard.style.display = 'none';
        navContent.classList.remove('hidden');
        navContent.style.display = 'block';
    }
});

// Load admin data (users and feedback)
async function loadAdminData() {
    // Only load if user is admin - double check
    if (currentUserType !== 'admin') {
        const adminDashboard = document.getElementById('admin-dashboard');
        const navContent = document.querySelector('.nav-content');
        adminDashboard.classList.add('hidden');
        adminDashboard.style.display = 'none'; // Force hide
        navContent.classList.remove('hidden');
        navContent.style.display = 'block'; // Force show
        return;
    }
    
    try {
        // Load users
        const usersResponse = await fetch('/admin/users');
        const usersData = await usersResponse.json();
        
        if (usersData.success) {
            displayUsers(usersData.users, usersData.total_logins);
        } else {
            // If access denied, hide the dashboard
            if (usersResponse.status === 403) {
                document.getElementById('admin-dashboard').classList.add('hidden');
                document.querySelector('.nav-content').classList.remove('hidden');
                return;
            }
            document.getElementById('users-list').innerHTML = '<p style="color: #6c757d;">No users have logged in yet.</p>';
        }
        
        // Load feedback
        const feedbackResponse = await fetch('/admin/feedback');
        const feedbackData = await feedbackResponse.json();
        
        if (feedbackData.success) {
            displayFeedback(feedbackData.feedback, feedbackData.total_feedback);
        } else {
            // If access denied, hide the dashboard
            if (feedbackResponse.status === 403) {
                document.getElementById('admin-dashboard').classList.add('hidden');
                document.querySelector('.nav-content').classList.remove('hidden');
                return;
            }
            document.getElementById('feedback-list').innerHTML = '<p style="color: #6c757d;">No feedback submitted yet.</p>';
        }
    } catch (error) {
        console.error('Failed to load admin data:', error);
        // Hide dashboard on error for non-admin users
        if (currentUserType !== 'admin') {
            document.getElementById('admin-dashboard').classList.add('hidden');
            document.querySelector('.nav-content').classList.remove('hidden');
        }
    }
}

// Display users list
function displayUsers(users, totalLogins) {
    const usersListDiv = document.getElementById('users-list');
    
    if (users.length === 0) {
        usersListDiv.innerHTML = '<p>No users have logged in yet.</p>';
        return;
    }
    
    let html = `
        <div class="admin-stats">
            <p><strong>Total Users:</strong> ${users.length} | <strong>Total Logins:</strong> ${totalLogins}</p>
        </div>
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Enrollment No.</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Login Count</th>
                    <th>Last Login</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    users.forEach(user => {
        html += `
            <tr>
                <td style="color: #212529; font-weight: 600;">${user.enrollment_no || 'N/A'}</td>
                <td style="color: #212529; font-weight: 500;">${user.name || 'N/A'}</td>
                <td><span class="badge badge-${user.user_type}">${user.user_type}</span></td>
                <td style="color: #212529; font-weight: 500;">${user.login_count || 0}</td>
                <td style="color: #212529; font-weight: 500;">${user.last_login || 'N/A'}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    usersListDiv.innerHTML = html;
}

// Display feedback list
function displayFeedback(feedback, totalFeedback) {
    const feedbackListDiv = document.getElementById('feedback-list');
    
    if (feedback.length === 0) {
        feedbackListDiv.innerHTML = '<p>No feedback submitted yet.</p>';
        return;
    }
    
    let html = `
        <div class="admin-stats">
            <p><strong>Total Feedback:</strong> ${totalFeedback}</p>
        </div>
        <div class="feedback-items">
    `;
    
    // Create array with indices for tracking original position
    const feedbackWithIndices = feedback.map((item, index) => ({
        ...item,
        originalIndex: index
    }));
    
    // Sort by timestamp (newest first) - but we need to find original index when deleting
    const sortedFeedback = [...feedbackWithIndices].reverse();
    
    sortedFeedback.forEach((item) => {
        const originalIndex = item.originalIndex;
        html += `
            <div class="feedback-item" data-feedback-index="${originalIndex}">
                <div class="feedback-header">
                    <div class="feedback-user-info">
                        <strong>${item.name}</strong> (${item.enrollment_no})
                        <span class="feedback-time">${item.timestamp}</span>
                    </div>
                    <button class="btn-delete-feedback" data-index="${originalIndex}" title="Delete this feedback">
                        🗑️ Delete
                    </button>
                </div>
                <div class="feedback-text">${item.feedback}</div>
            </div>
        `;
    });
    
    html += `</div>`;
    
    feedbackListDiv.innerHTML = html;
    
    // Attach delete event listeners to all delete buttons
    document.querySelectorAll('.btn-delete-feedback').forEach(button => {
        button.addEventListener('click', async function() {
            const feedbackIndex = parseInt(this.getAttribute('data-index'));
            await deleteFeedback(feedbackIndex);
        });
    });
}

// Delete feedback function
async function deleteFeedback(feedbackIndex) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch('/admin/feedback/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ index: feedbackIndex })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Reload feedback list
            await loadAdminData();
        } else {
            alert('Error: ' + (data.error || 'Failed to delete feedback'));
        }
    } catch (error) {
        console.error('Failed to delete feedback:', error);
        alert('Network error. Please try again.');
    }
}

// Submit feedback handler
document.getElementById('submit-feedback-btn').addEventListener('click', async function() {
    const feedbackText = document.getElementById('feedback-input').value.trim();
    const feedbackMessage = document.getElementById('feedback-message');
    
    if (!feedbackText) {
        feedbackMessage.textContent = 'Please enter your feedback.';
        feedbackMessage.classList.remove('hidden');
        feedbackMessage.style.color = '#dc3545';
        return;
    }
    
    try {
        const response = await fetch('/submit-feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ feedback: feedbackText })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            feedbackMessage.textContent = data.message;
            feedbackMessage.style.color = '#28a745';
            feedbackMessage.classList.remove('hidden');
            document.getElementById('feedback-input').value = '';
            
            // Hide message after 3 seconds
            setTimeout(() => {
                feedbackMessage.classList.add('hidden');
            }, 3000);
        } else {
            feedbackMessage.textContent = data.error || 'Failed to submit feedback.';
            feedbackMessage.style.color = '#dc3545';
            feedbackMessage.classList.remove('hidden');
        }
    } catch (error) {
        feedbackMessage.textContent = 'Network error. Please try again.';
        feedbackMessage.style.color = '#dc3545';
        feedbackMessage.classList.remove('hidden');
    }
});

// Find path handler
document.getElementById('find-path-btn').addEventListener('click', async function() {
    const block = document.getElementById('block-select').value;
    const classroom = document.getElementById('classroom-input').value.trim().toUpperCase();
    const preference = document.querySelector('input[name="preference"]:checked').value;
    const errorDiv = document.getElementById('path-error');
    const resultDiv = document.getElementById('path-result');
    
    errorDiv.classList.remove('show');
    errorDiv.textContent = '';
    resultDiv.classList.add('hidden');
    
    if (!block || !classroom) {
        errorDiv.textContent = 'Please select a block and enter a classroom number.';
        errorDiv.classList.add('show');
        return;
    }
    
    // Validate classroom format - supports both formats:
    // New: B-LA-204, B-CA-219, B-TR-217, etc.
    // Old: B-202, A-301, etc.
    const classroomPatternNew = /^[ABNP]-[A-Z]+-\d+$/;  // B-LA-204 format
    const classroomPatternOld = /^[ABNP]-(\d)(\d{2})$/;  // B-202 format
    
    let floorNumber = null;
    let isValidFormat = false;
    
    if (classroomPatternNew.test(classroom)) {
        // New format: B-LA-204 - extract floor from room number (first digit)
        const roomNumMatch = classroom.match(/-(\d+)$/);
        if (roomNumMatch) {
            const roomNum = roomNumMatch[1];
            floorNumber = parseInt(roomNum[0]);
            isValidFormat = true;
        }
    } else if (classroomPatternOld.test(classroom)) {
        // Old format: B-202
        const match = classroom.match(classroomPatternOld);
        if (match) {
            floorNumber = parseInt(match[1]);
            isValidFormat = true;
        }
    }
    
    if (!isValidFormat) {
        errorDiv.textContent = 'Invalid classroom format. Use format like B-LA-204, B-CA-219, B-202, etc.';
        errorDiv.classList.add('show');
        return;
    }
    
    // Validate floor number (0 = ground, 1-3 = floors 1-3)
    if (floorNumber < 0 || floorNumber > 3) {
        errorDiv.textContent = `Invalid floor number. Floors available are: Ground (0), 1st (1), 2nd (2), and 3rd (3). You entered floor ${floorNumber}.`;
        errorDiv.classList.add('show');
        return;
    }
    
    // Validate block matches classroom block
    if (classroom[0] !== block) {
        errorDiv.textContent = `Block mismatch. You selected ${block} Block but entered classroom ${classroom}. Please check your selection.`;
        errorDiv.classList.add('show');
        return;
    }
    
    try {
        const response = await fetch('/get-path', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ block, classroom, preference })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            displayPath(data);
            resultDiv.classList.remove('hidden');
        } else {
            errorDiv.textContent = data.error || 'Path not found. Please check your inputs.';
            errorDiv.classList.add('show');
        }
    } catch (error) {
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.classList.add('show');
    }
});

function displayPath(data) {
    // Update path information
    document.getElementById('path-distance').textContent = data.distance;
    document.getElementById('path-steps').textContent = data.steps;
    document.getElementById('path-route').textContent = data.preference === 'lift' ? 'Via Lift' : 'Via Stairs';
    
    // Display step-by-step directions
    const stepsList = document.getElementById('path-steps-list');
    stepsList.innerHTML = '';
    
    const path = data.path;
    const directions = generateDirections(path, data.preference);
    
    directions.forEach((direction, index) => {
        const li = document.createElement('li');
        li.textContent = direction;
        stepsList.appendChild(li);
    });
    
    // Display visual map
    displayMap(data.path, data.preference);
}

function generateDirections(path, preference) {
    const directions = [];
    
    for (let i = 0; i < path.length; i++) {
        const current = path[i];
        const next = path[i + 1];
        
        if (!next) {
            directions.push(`Arrive at your destination: ${current}`);
            break;
        }
        
        // Entrance to block
        if (current.includes('_entrance') && !next.includes('_entrance')) {
            const block = current.split('_')[0];
            directions.push(`Enter ${block} Block`);
        }
        
        // Choose lift or stairs
        if (next.includes('lift') && preference === 'lift') {
            directions.push(`Take the lift to the floor`);
        } else if (next.includes('stairs') && preference === 'stairs') {
            directions.push(`Take the stairs to the floor`);
        }
        
        // Floor navigation
        if (current.includes('floor') && next.includes('floor')) {
            const floorNum = current.match(/\d+/)?.[0] || '';
            directions.push(`You are on floor ${floorNum}`);
        }
        
        // Moving to classroom (supports both formats: B-LA-204 and B-202)
        if (next.match(/^[ABNP]-\d{3}$/) || next.match(/^[ABNP]-[A-Z]+-\d+$/)) {
            directions.push(`Proceed to classroom ${next}`);
        }
        
        // Corridor navigation
        if (current.includes('corridor') && next.includes('corridor')) {
            const direction = current.includes('left') ? 'Continue along left corridor' : 
                            current.includes('right') ? 'Continue along right corridor' : 
                            'Continue along corridor';
            directions.push(direction);
        }
        
        // Lobby to corridor
        if (current.includes('lobby') && next.includes('corridor')) {
            if (next.includes('left')) {
                directions.push('Turn left and proceed along the left corridor');
            } else if (next.includes('right')) {
                directions.push('Turn right and proceed along the right corridor');
            } else {
                directions.push('Proceed to the corridor');
            }
        }
        
        // Inter-block movement
        if (current.includes('_entrance') && next.includes('_entrance')) {
            const fromBlock = current.split('_')[0];
            const toBlock = next.split('_')[0];
            directions.push(`Walk from ${fromBlock} Block to ${toBlock} Block`);
        }
    }
    
    return directions.length > 0 ? directions : path.map((step, i) => `${i + 1}. ${step}`);
}

function displayMap(path, preference) {
    const mapDisplay = document.getElementById('map-display');
    mapDisplay.innerHTML = '';
    
    // Extract block and classroom from path
    const classroom = path[path.length - 1];
    const blockMatch = classroom.match(/^([ABNP])-/);
    
    if (!blockMatch) {
        mapDisplay.innerHTML = '<div class="map-placeholder"><p>Map visualization for: ' + classroom + '</p></div>';
        return;
    }
    
    const targetBlock = blockMatch[1];
    // Extract floor number - supports both formats:
    // B-LA-204 (new format) - first digit of room number
    // B-202 (old format) - first digit after dash
    let targetFloorNum = 1;
    const floorMatchNew = classroom.match(/^[ABNP]-[A-Z]+-(\d)/);  // B-LA-204
    const floorMatchOld = classroom.match(/^[ABNP]-(\d)\d{2}$/);   // B-202
    
    if (floorMatchNew) {
        targetFloorNum = parseInt(floorMatchNew[1]);
    } else if (floorMatchOld) {
        targetFloorNum = parseInt(floorMatchOld[1]);
    }
    
    const targetFloor = targetFloorNum === 0 ? 'Ground' : targetFloorNum.toString();
    
    // Create block visualization
    const blockMap = document.createElement('div');
    blockMap.className = 'block-map';
    
    // Create floor plan
    const floorPlan = document.createElement('div');
    floorPlan.className = 'floor-plan';
    
    // Show the target floor
    const floor = document.createElement('div');
    floor.className = 'floor';
    
    const floorLabel = document.createElement('div');
    floorLabel.className = 'floor-label';
    const floorDisplayName = targetFloorNum === 0 ? 'Ground Floor' : `Floor ${targetFloor}`;
    floorLabel.textContent = `${targetBlock} Block - ${floorDisplayName}`;
    floor.appendChild(floorLabel);
    
    const rooms = document.createElement('div');
    rooms.className = 'rooms';
    
    // Generate room numbers for this floor based on actual floor plans
    let roomList = [];
    
    if (targetBlock === 'B') {
        // Block B specific rooms based on actual floor plans
        if (targetFloorNum === 0) {
            roomList = ['B-Server-Room', 'B-UPS', 'B-IT-Room', 'B-Pharmacy', 'B-Museum', 'B-Moot-Court-Hall', 'B-Registrar-office', 'B-Tertiary-Room', 'B-Office-Area-1', 'B-Admission-Lounge', 'B-ATM'];
        } else if (targetFloorNum === 1) {
            roomList = ['B-LA-101', 'B-LA-102', 'B-LA-103', 'B-LA-104', 'B-LA-105', 'B-LA-106-D', 'B-LH-102', 'B-LA-107', 'B-LA-108', 'B-LA-109', 'B-LA-110'];
        } else if (targetFloorNum === 2) {
            roomList = ['B-LA-202-A', 'B-LA-202-B', 'B-LA-203-A', 'B-LA-204', 'B-LA-205', 'B-LA-206', 'B-CA-219', 'B-CA-220', 'B-LA-207', 'B-LA-208', 'B-LA-209', 'B-LA-210', 'B-LA-211-A', 'B-LA-211-B', 'B-LA-212', 'B-LA-213', 'B-LA-214', 'B-LA-215', 'B-LA-216', 'B-TR-217', 'B-TR-218', 'B-TR-221', 'B-TR-222', 'B-TR-223'];
        } else if (targetFloorNum === 3) {
            roomList = ['B-LA-301', 'B-LA-303', 'B-LA-304', 'B-LA-305', 'B-LA-307', 'B-TR-301', 'B-TR-302', 'B-TR-307', 'B-CA-302-A', 'B-CA-302-B', 'B-CA-303', 'B-CA-304', 'B-CA-305', 'B-CA-306', 'B-CA-306-A', 'B-CA-306-B', 'B-CA-308', 'B-CA-309', 'B-CA-310', 'B-CA-311', 'B-CA-312'];
        }
    } else if (targetBlock === 'A') {
        // Block A rooms
        if (targetFloorNum === 0) {
            roomList = ['A-001', 'A-002', 'A-003', 'A-004', 'A-005', 'A-006', 'A-007', 'A-008', 'A-009', 'A-010'];
        } else if (targetFloorNum === 1) {
            roomList = ['A-101', 'A-102', 'A-103', 'A-104', 'A-105', 'A-106', 'A-107', 'A-108', 'A-109', 'A-110'];
        } else if (targetFloorNum === 2) {
            roomList = ['A-201', 'A-202', 'A-203', 'A-204', 'A-205', 'A-206', 'A-207', 'A-208', 'A-209', 'A-210', 'A-211', 'A-212', 'A-213', 'A-214', 'A-215', 'A-216'];
        } else if (targetFloorNum === 3) {
            roomList = ['A-301', 'A-302', 'A-303', 'A-304', 'A-305', 'A-306', 'A-307', 'A-308', 'A-309', 'A-310', 'A-311', 'A-312'];
        }
    } else if (targetBlock === 'N') {
        // Block N rooms
        if (targetFloorNum === 0) {
            roomList = ['N-001', 'N-002', 'N-003', 'N-004', 'N-005', 'N-006', 'N-007', 'N-008', 'N-009', 'N-010'];
        } else if (targetFloorNum === 1) {
            roomList = ['N-101', 'N-102', 'N-103', 'N-104', 'N-105', 'N-106', 'N-107', 'N-108', 'N-109', 'N-110'];
        } else if (targetFloorNum === 2) {
            roomList = ['N-201', 'N-202', 'N-203', 'N-204', 'N-205', 'N-206', 'N-207', 'N-208', 'N-209', 'N-210', 'N-211', 'N-212', 'N-213', 'N-214', 'N-215', 'N-216'];
        } else if (targetFloorNum === 3) {
            roomList = ['N-301', 'N-302', 'N-303', 'N-304', 'N-305', 'N-306', 'N-307', 'N-308', 'N-309', 'N-310', 'N-311', 'N-312'];
        }
    } else if (targetBlock === 'P') {
        // Block P rooms
        if (targetFloorNum === 0) {
            roomList = ['P-001', 'P-002', 'P-003', 'P-004', 'P-005', 'P-006', 'P-007', 'P-008', 'P-009', 'P-010'];
        } else if (targetFloorNum === 1) {
            roomList = ['P-101', 'P-102', 'P-103', 'P-104', 'P-105', 'P-106', 'P-107', 'P-108', 'P-109', 'P-110'];
        } else if (targetFloorNum === 2) {
            roomList = ['P-201', 'P-202', 'P-203', 'P-204', 'P-205', 'P-206', 'P-207', 'P-208', 'P-209', 'P-210', 'P-211', 'P-212', 'P-213', 'P-214', 'P-215', 'P-216'];
        } else if (targetFloorNum === 3) {
            roomList = ['P-301', 'P-302', 'P-303', 'P-304', 'P-305', 'P-306', 'P-307', 'P-308', 'P-309', 'P-310', 'P-311', 'P-312'];
        }
    } else {
        // For other blocks, use generic format
        for (let i = 1; i <= 4; i++) {
            const roomNum = `${targetBlock}-${targetFloorNum}${i.toString().padStart(2, '0')}`;
            roomList.push(roomNum);
        }
    }
    
    // Display rooms
    roomList.forEach(roomNum => {
        const room = document.createElement('div');
        room.className = 'room';
        room.textContent = roomNum;
        
        if (roomNum === classroom || roomNum.toUpperCase() === classroom.toUpperCase()) {
            room.classList.add('highlight');
            room.title = 'Your Destination';
        }
        
        rooms.appendChild(room);
    });
    
    floor.appendChild(rooms);
    floorPlan.appendChild(floor);
    
    // Add route indicator
    const routeInfo = document.createElement('div');
    routeInfo.style.marginTop = '15px';
    routeInfo.style.padding = '20px';
    routeInfo.style.background = '#ffffff';
    routeInfo.style.borderRadius = '8px';
    routeInfo.style.border = '2px solid #667eea';
    routeInfo.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    routeInfo.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <span style="font-size: 1.5em;">${preference === 'lift' ? '🛗' : '🪜'}</span>
            <strong style="color: #212529; font-size: 1.05em;">Route Preference:</strong> 
            <span style="color: #495057; font-weight: 600; font-size: 1.05em;">${preference === 'lift' ? '电梯 Lift' : 'Stairs'}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.5em;">📍</span>
            <strong style="color: #212529; font-size: 1.05em;">Destination:</strong> 
            <span style="font-weight: 700; color: #28a745; font-size: 1.1em;">${classroom}</span>
        </div>
    `;
    
    mapDisplay.appendChild(floorPlan);
    mapDisplay.appendChild(routeInfo);
    
    // Add visual diagram (rough floor plan) - BEFORE path visualization
    try {
        console.log('Attempting to create diagram...');
        const diagramContainer = createFloorDiagram(path, targetBlock, targetFloorNum, classroom, preference);
        if (diagramContainer) {
            console.log('Diagram container created, appending to mapDisplay');
            mapDisplay.appendChild(diagramContainer);
            // Scroll to diagram
            setTimeout(() => {
                diagramContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        } else {
            console.error('Diagram container is null');
        }
    } catch (error) {
        console.error('Error creating diagram:', error);
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.style.padding = '15px';
        errorDiv.style.background = '#fff3cd';
        errorDiv.style.borderRadius = '4px';
        errorDiv.style.marginTop = '15px';
        errorDiv.style.border = '2px solid #ffc107';
        errorDiv.innerHTML = '<strong>⚠️ Diagram Error:</strong> ' + error.message + '<br>Check browser console for details.';
        mapDisplay.appendChild(errorDiv);
    }
    
    // Add path visualization with better styling
    const pathViz = document.createElement('div');
    pathViz.style.marginTop = '20px';
    pathViz.style.padding = '20px';
    pathViz.style.background = '#fff';
    pathViz.style.borderRadius = '8px';
    pathViz.style.border = '2px solid #e0e0e0';
    pathViz.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    
    const pathTitle = document.createElement('div');
    pathTitle.style.fontWeight = '700';
    pathTitle.style.marginBottom = '15px';
    pathTitle.style.color = '#212529';
    pathTitle.style.fontSize = '1.2em';
    pathTitle.innerHTML = '🧭 Navigation Path:';
    pathViz.appendChild(pathTitle);
    
    const pathSteps = document.createElement('div');
    pathSteps.style.display = 'flex';
    pathSteps.style.flexWrap = 'wrap';
    pathSteps.style.gap = '8px';
    pathSteps.style.alignItems = 'center';
    
    path.forEach((step, index) => {
        const stepDiv = document.createElement('span');
        stepDiv.style.padding = '8px 12px';
        stepDiv.style.borderRadius = '6px';
        stepDiv.style.fontSize = '0.9em';
        stepDiv.style.fontWeight = '500';
        stepDiv.style.transition = 'all 0.3s';
        
        if (index === 0) {
            stepDiv.style.background = '#667eea';
            stepDiv.style.color = 'white';
            stepDiv.textContent = '🚪 ' + step.replace('_entrance', ' Entrance');
        } else if (index === path.length - 1) {
            stepDiv.style.background = '#28a745';
            stepDiv.style.color = 'white';
            stepDiv.textContent = '✅ ' + step;
        } else if (step.includes('lift')) {
            stepDiv.style.background = '#fff8e1';
            stepDiv.style.color = '#e65100';
            stepDiv.style.border = '2px solid #ff9800';
            stepDiv.style.fontWeight = '600';
            stepDiv.textContent = '🛗 Lift';
        } else if (step.includes('stairs')) {
            stepDiv.style.background = '#e0f7fa';
            stepDiv.style.color = '#006064';
            stepDiv.style.border = '2px solid #00acc1';
            stepDiv.style.fontWeight = '600';
            stepDiv.textContent = '🪜 Stairs';
        } else if (step.includes('floor')) {
            stepDiv.style.background = '#e3f2fd';
            stepDiv.style.color = '#0d47a1';
            stepDiv.style.border = '2px solid #2196f3';
            stepDiv.style.fontWeight = '600';
            stepDiv.textContent = step.replace('_', ' ').replace(/([ABNP])/, '$1 ').replace('floor', 'Floor');
        } else {
            stepDiv.style.background = '#ffffff';
            stepDiv.style.color = '#212529';
            stepDiv.style.border = '2px solid #dee2e6';
            stepDiv.style.fontWeight = '600';
            stepDiv.textContent = step;
        }
        
        pathSteps.appendChild(stepDiv);
        
        if (index < path.length - 1) {
            const arrow = document.createElement('span');
            arrow.textContent = '→';
            arrow.style.color = '#667eea';
            arrow.style.fontSize = '1.2em';
            arrow.style.fontWeight = 'bold';
            pathSteps.appendChild(arrow);
        }
    });
    
    pathViz.appendChild(pathSteps);
    mapDisplay.appendChild(pathViz);
    
    // Add helpful tips
    const tips = document.createElement('div');
    tips.style.marginTop = '20px';
    tips.style.padding = '18px';
    tips.style.background = '#fff8e1';
    tips.style.borderRadius = '8px';
    tips.style.border = '2px solid #ff9800';
    tips.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    tips.innerHTML = `
        <strong style="color: #e65100; font-size: 1.1em;">💡 Tips:</strong>
        <ul style="margin: 12px 0 0 25px; padding: 0; color: #5d4037; line-height: 1.8;">
            <li style="margin-bottom: 6px;">Follow the path step by step</li>
            <li style="margin-bottom: 6px;">Look for block signs and room numbers</li>
            <li>If you get lost, return to the entrance and restart</li>
        </ul>
    `;
    mapDisplay.appendChild(tips);
}

function createFloorDiagram(path, block, floorNum, destination, preference) {
    console.log('Creating diagram for:', { block, floorNum, destination, path });
    
    const container = document.createElement('div');
    container.style.marginTop = '25px';
    container.style.padding = '20px';
    container.style.background = '#ffffff';
    container.style.borderRadius = '8px';
    container.style.border = '2px solid #667eea';
    container.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    container.id = 'floor-diagram-container';
    
    const title = document.createElement('h4');
    title.style.color = '#212529';
    title.style.marginBottom = '15px';
    title.style.fontWeight = '700';
    title.style.fontSize = '1.2em';
    title.textContent = '📐 Visual Floor Plan Diagram (Starting from Lift/Stairs Exit)';
    container.appendChild(title);
    
    // Add step-by-step instructions panel
    const instructionsPanel = document.createElement('div');
    instructionsPanel.style.marginBottom = '20px';
    instructionsPanel.style.padding = '15px';
    instructionsPanel.style.background = '#fff3cd';
    instructionsPanel.style.borderRadius = '6px';
    instructionsPanel.style.border = '2px solid #ffc107';
    
    const instructionsTitle = document.createElement('div');
    instructionsTitle.style.fontWeight = '700';
    instructionsTitle.style.marginBottom = '10px';
    instructionsTitle.style.color = '#856404';
    instructionsTitle.textContent = '📍 Step-by-Step Directions:';
    instructionsPanel.appendChild(instructionsTitle);
    
    const stepsList = document.createElement('ol');
    stepsList.style.margin = '0';
    stepsList.style.paddingLeft = '20px';
    stepsList.style.color = '#856404';
    stepsList.style.lineHeight = '1.8';
    
    // Generate step-by-step instructions from path (starting from lift/stairs exit)
    let stepCount = 1;
    let startFromLobby = false;
    
    // Find where to start (after exiting lift/stairs)
    for (let i = 0; i < path.length - 1; i++) {
        const current = path[i];
        const next = path[i + 1];
        
        // Start from lobby after exiting lift/stairs
        if ((current.includes('lift') || current.includes('stairs')) && next.includes('lobby')) {
            startFromLobby = true;
        }
        
        // Only show instructions from lobby onwards
        if (!startFromLobby) continue;
        
        let instruction = '';
        
        if (next.includes('lobby') && (current.includes('lift') || current.includes('stairs'))) {
            instruction = `Exit the ${preference === 'lift' ? 'Lift' : 'Stairs'} - You are now in the Lobby`;
        } else if (next.includes('left_corridor')) {
            instruction = `Turn LEFT and proceed along the left corridor`;
        } else if (next.includes('right_corridor')) {
            instruction = `Turn RIGHT and proceed along the right corridor`;
        } else if (next.includes('center')) {
            instruction = `Proceed to the center area`;
        } else if (next.match(/^[ABNP]-/)) {
            instruction = `Arrive at your destination: ${next}`;
        }
        
        if (instruction) {
            const li = document.createElement('li');
            li.textContent = instruction;
            li.style.marginBottom = '5px';
            stepsList.appendChild(li);
            stepCount++;
        }
    }
    
    instructionsPanel.appendChild(stepsList);
    container.appendChild(instructionsPanel);
    
    const canvasWrapper = document.createElement('div');
    canvasWrapper.style.width = '100%';
    canvasWrapper.style.overflowX = 'auto';
    canvasWrapper.style.textAlign = 'center';
    
    const canvas = document.createElement('canvas');
    // Set actual pixel size for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = 800;
    const displayHeight = 600;
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    canvas.style.border = '3px solid #667eea';
    canvas.style.borderRadius = '8px';
    canvas.style.background = '#ffffff';
    canvas.style.display = 'block';
    canvas.style.margin = '10px auto';
    canvas.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    canvas.id = 'floor-diagram-canvas';
    canvas.setAttribute('aria-label', 'Floor plan diagram');
    
    canvasWrapper.appendChild(canvas);
    container.appendChild(canvasWrapper);
    
    const ctx = canvas.getContext('2d');
    // Scale context for high DPI
    ctx.scale(dpr, dpr);
    
    // Draw floor plan based on block structure
    try {
        if (block === 'B') {
            drawBlockBFloorPlan(ctx, floorNum, path, destination, preference);
        } else if (block === 'A') {
            drawBlockAFloorPlan(ctx, floorNum, path, destination, preference);
        } else if (block === 'N') {
            drawBlockNFloorPlan(ctx, floorNum, path, destination, preference);
        } else if (block === 'P') {
            drawBlockPFloorPlan(ctx, floorNum, path, destination, preference);
        } else {
            drawGenericFloorPlan(ctx, floorNum, path, destination, preference);
        }
        console.log('Diagram drawn successfully');
    } catch (error) {
        console.error('Error drawing diagram:', error);
        // Draw error message on canvas
        ctx.fillStyle = '#dc3545';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Error drawing diagram. Check console.', displayWidth/2, displayHeight/2);
    }
    
    // Add legend
    const legend = document.createElement('div');
    legend.style.marginTop = '15px';
    legend.style.padding = '12px';
    legend.style.background = '#ffffff';
    legend.style.border = '2px solid #667eea';
    legend.style.borderRadius = '6px';
    legend.style.fontSize = '0.95em';
    legend.style.color = '#212529';
    legend.style.fontWeight = '500';
    legend.innerHTML = `
        <strong style="color: #212529; font-weight: 700; font-size: 1.05em;">Legend:</strong>
        <span style="display: inline-block; width: 22px; height: 22px; background: #667eea; margin: 0 8px 0 15px; border-radius: 4px; vertical-align: middle; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></span> 
        <span style="color: #212529; font-weight: 600;">Start</span>
        <span style="display: inline-block; width: 22px; height: 22px; background: #28a745; margin: 0 8px 0 15px; border-radius: 4px; vertical-align: middle; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></span> 
        <span style="color: #212529; font-weight: 600;">Destination</span>
        <span style="display: inline-block; width: 22px; height: 22px; background: #ffc107; margin: 0 8px 0 15px; border-radius: 4px; vertical-align: middle; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></span> 
        <span style="color: #212529; font-weight: 600;">Path</span>
        <span style="display: inline-block; width: 22px; height: 22px; background: #17a2b8; margin: 0 8px 0 15px; border-radius: 4px; vertical-align: middle; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></span> 
        <span style="color: #212529; font-weight: 600;">${preference === 'lift' ? 'Lift' : 'Stairs'}</span>
    `;
    container.appendChild(legend);
    
    return container;
}

function drawBlockBFloorPlan(ctx, floorNum, path, destination, preference) {
    const width = 800;
    const height = 600;
    
    console.log('Drawing Block B floor plan for floor:', floorNum);
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background with border
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Draw border
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, width - 4, height - 4);
    
    // Draw title at top
    ctx.fillStyle = '#212529';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Block B - Floor ${floorNum === 0 ? 'Ground' : floorNum}`, width/2, 30);
    
    // Define layout based on floor
    let layout = getBlockBLayout(floorNum);
    
    if (!layout) {
        console.error('Layout not found for floor:', floorNum);
        ctx.fillStyle = '#dc3545';
        ctx.font = '16px Arial';
        ctx.fillText('Layout not available for this floor', width/2, height/2);
        return;
    }
    
    // Use common drawing function for floor elements (includes destination highlighting)
    drawCommonFloorElements(ctx, layout, preference, destination);
    
    // Draw path (starts from lift/stairs exit)
    drawPathOnDiagram(ctx, path, layout, destination, preference);
    
    // Draw destination marker
    const destRoom = layout.rooms?.find(r => r.name === destination || r.name.toUpperCase() === destination.toUpperCase());
    if (destRoom) {
        ctx.fillStyle = '#28a745';
        ctx.beginPath();
        ctx.arc(destRoom.x + destRoom.w/2, destRoom.y - 10, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('END', destRoom.x + destRoom.w/2, destRoom.y - 10 + 3);
    }
}

function getBlockBLayout(floorNum) {
    const width = 800;
    const height = 600;
    
    const layout = {
        lobby: { x: width/2 - 80, y: height/2 - 60, w: 160, h: 120 },
        leftCorridor: null,
        rightCorridor: null,
        center: null,
        rooms: []
    };
    
    if (floorNum === 0) {
        // Ground floor layout
        layout.leftCorridor = { x: 50, y: 100, w: 200, h: 400 };
        layout.rightCorridor = { x: 550, y: 100, w: 200, h: 400 };
        layout.center = { x: 300, y: 200, w: 200, h: 200 };
        
        // Ground floor rooms
        layout.rooms = [
            { name: 'B-Server-Room', x: 60, y: 120, w: 80, h: 60 },
            { name: 'B-UPS', x: 60, y: 200, w: 80, h: 60 },
            { name: 'B-IT-Room', x: 60, y: 280, w: 80, h: 60 },
            { name: 'B-Pharmacy', x: 60, y: 360, w: 80, h: 60 },
            { name: 'B-Museum', x: 320, y: 220, w: 80, h: 60 },
            { name: 'B-Moot-Court-Hall', x: 320, y: 300, w: 80, h: 60 },
            { name: 'B-Registrar-office', x: 420, y: 220, w: 80, h: 60 },
            { name: 'B-Tertiary-Room', x: 560, y: 120, w: 80, h: 60 },
            { name: 'B-Office-Area-1', x: 560, y: 200, w: 80, h: 60 },
            { name: 'B-Admission-Lounge', x: 560, y: 280, w: 80, h: 60 },
            { name: 'B-ATM', x: 560, y: 360, w: 80, h: 60 }
        ];
    } else if (floorNum === 1) {
        // First floor
        layout.leftCorridor = { x: 50, y: 100, w: 200, h: 400 };
        layout.rightCorridor = { x: 550, y: 100, w: 200, h: 400 };
        layout.center = { x: 300, y: 200, w: 200, h: 200 };
        
        layout.rooms = [
            { name: 'B-LA-107', x: 60, y: 120, w: 70, h: 50 },
            { name: 'B-LA-108', x: 60, y: 180, w: 70, h: 50 },
            { name: 'B-LA-109', x: 60, y: 240, w: 70, h: 50 },
            { name: 'B-LA-110', x: 60, y: 300, w: 70, h: 50 },
            { name: 'B-LA-101', x: 320, y: 220, w: 60, h: 40 },
            { name: 'B-LA-102', x: 390, y: 220, w: 60, h: 40 },
            { name: 'B-LA-103', x: 320, y: 270, w: 60, h: 40 },
            { name: 'B-LA-104', x: 390, y: 270, w: 60, h: 40 },
            { name: 'B-LA-105', x: 320, y: 320, w: 60, h: 40 },
            { name: 'B-LA-106-D', x: 560, y: 120, w: 70, h: 50 },
            { name: 'B-LH-102', x: 560, y: 180, w: 70, h: 50 }
        ];
    } else if (floorNum === 2) {
        // Second floor - has left and right corridors
        layout.leftCorridor = { x: 50, y: 100, w: 200, h: 400 };
        layout.rightCorridor = { x: 550, y: 100, w: 200, h: 400 };
        layout.center = { x: 300, y: 200, w: 200, h: 200 };
        
        layout.rooms = [
            // Left corridor rooms
            { name: 'B-LA-207', x: 60, y: 120, w: 70, h: 40 },
            { name: 'B-LA-208', x: 60, y: 170, w: 70, h: 40 },
            { name: 'B-LA-209', x: 60, y: 220, w: 70, h: 40 },
            { name: 'B-LA-210', x: 60, y: 270, w: 70, h: 40 },
            { name: 'B-LA-211-A', x: 60, y: 320, w: 70, h: 40 },
            { name: 'B-LA-211-B', x: 140, y: 320, w: 70, h: 40 },
            { name: 'B-LA-212', x: 60, y: 370, w: 70, h: 40 },
            { name: 'B-LA-213', x: 60, y: 420, w: 70, h: 40 },
            { name: 'B-LA-214', x: 60, y: 470, w: 70, h: 40 },
            { name: 'B-LA-215', x: 140, y: 470, w: 70, h: 40 },
            // Center rooms
            { name: 'B-LA-216', x: 320, y: 220, w: 60, h: 40 },
            { name: 'B-TR-217', x: 390, y: 220, w: 60, h: 40 },
            { name: 'B-TR-218', x: 320, y: 270, w: 60, h: 40 },
            { name: 'B-TR-221', x: 320, y: 320, w: 60, h: 40 },
            { name: 'B-TR-222', x: 390, y: 320, w: 60, h: 40 },
            { name: 'B-TR-223', x: 320, y: 370, w: 60, h: 40 },
            // Right corridor rooms
            { name: 'B-LA-202-A', x: 560, y: 120, w: 70, h: 40 },
            { name: 'B-LA-202-B', x: 640, y: 120, w: 70, h: 40 },
            { name: 'B-LA-203-A', x: 560, y: 170, w: 70, h: 40 },
            { name: 'B-LA-204', x: 560, y: 220, w: 70, h: 40 },
            { name: 'B-LA-205', x: 560, y: 270, w: 70, h: 40 },
            { name: 'B-LA-206', x: 560, y: 320, w: 70, h: 40 },
            { name: 'B-CA-219', x: 560, y: 370, w: 70, h: 40 },
            { name: 'B-CA-220', x: 640, y: 370, w: 70, h: 40 }
        ];
    } else if (floorNum === 3) {
        // Third floor
        layout.leftCorridor = { x: 50, y: 100, w: 200, h: 400 };
        layout.rightCorridor = { x: 550, y: 100, w: 200, h: 400 };
        layout.center = { x: 300, y: 200, w: 200, h: 200 };
        
        layout.rooms = [
            { name: 'B-LA-301', x: 60, y: 120, w: 70, h: 50 },
            { name: 'B-LA-303', x: 60, y: 180, w: 70, h: 50 },
            { name: 'B-LA-304', x: 60, y: 240, w: 70, h: 50 },
            { name: 'B-LA-305', x: 60, y: 300, w: 70, h: 50 },
            { name: 'B-LA-307', x: 60, y: 360, w: 70, h: 50 },
            { name: 'B-TR-301', x: 320, y: 220, w: 60, h: 40 },
            { name: 'B-TR-302', x: 390, y: 220, w: 60, h: 40 },
            { name: 'B-TR-307', x: 320, y: 270, w: 60, h: 40 },
            { name: 'B-CA-302-A', x: 560, y: 120, w: 60, h: 40 },
            { name: 'B-CA-302-B', x: 630, y: 120, w: 60, h: 40 },
            { name: 'B-CA-303', x: 560, y: 170, w: 60, h: 40 },
            { name: 'B-CA-304', x: 630, y: 170, w: 60, h: 40 },
            { name: 'B-CA-305', x: 560, y: 220, w: 60, h: 40 },
            { name: 'B-CA-306', x: 630, y: 220, w: 60, h: 40 },
            { name: 'B-CA-306-A', x: 560, y: 270, w: 60, h: 40 },
            { name: 'B-CA-306-B', x: 630, y: 270, w: 60, h: 40 },
            { name: 'B-CA-308', x: 560, y: 320, w: 60, h: 40 },
            { name: 'B-CA-309', x: 630, y: 320, w: 60, h: 40 },
            { name: 'B-CA-310', x: 560, y: 370, w: 60, h: 40 },
            { name: 'B-CA-311', x: 630, y: 370, w: 60, h: 40 },
            { name: 'B-CA-312', x: 560, y: 420, w: 60, h: 40 }
        ];
    }
    
    return layout;
}

function getBlockALayout(floorNum) {
    const width = 800;
    const height = 600;
    
    const layout = {
        lobby: { x: width/2 - 80, y: height/2 - 60, w: 160, h: 120 },
        leftCorridor: null,
        rightCorridor: null,
        center: null,
        rooms: []
    };
    
    if (floorNum === 0) {
        layout.leftCorridor = { x: 50, y: 100, w: 200, h: 400 };
        layout.rightCorridor = { x: 550, y: 100, w: 200, h: 400 };
        layout.center = { x: 300, y: 200, w: 200, h: 200 };
        
        layout.rooms = [
            { name: 'A-001', x: 60, y: 120, w: 80, h: 60 },
            { name: 'A-002', x: 60, y: 200, w: 80, h: 60 },
            { name: 'A-003', x: 60, y: 280, w: 80, h: 60 },
            { name: 'A-004', x: 60, y: 360, w: 80, h: 60 },
            { name: 'A-005', x: 320, y: 220, w: 80, h: 60 },
            { name: 'A-006', x: 320, y: 300, w: 80, h: 60 },
            { name: 'A-007', x: 560, y: 120, w: 80, h: 60 },
            { name: 'A-008', x: 560, y: 200, w: 80, h: 60 },
            { name: 'A-009', x: 560, y: 280, w: 80, h: 60 },
            { name: 'A-010', x: 560, y: 360, w: 80, h: 60 }
        ];
    } else if (floorNum === 1) {
        layout.leftCorridor = { x: 50, y: 100, w: 200, h: 400 };
        layout.rightCorridor = { x: 550, y: 100, w: 200, h: 400 };
        layout.center = { x: 300, y: 200, w: 200, h: 200 };
        
        layout.rooms = [
            { name: 'A-101', x: 60, y: 120, w: 70, h: 50 },
            { name: 'A-102', x: 60, y: 180, w: 70, h: 50 },
            { name: 'A-103', x: 60, y: 240, w: 70, h: 50 },
            { name: 'A-104', x: 60, y: 300, w: 70, h: 50 },
            { name: 'A-105', x: 320, y: 220, w: 60, h: 40 },
            { name: 'A-106', x: 390, y: 220, w: 60, h: 40 },
            { name: 'A-107', x: 320, y: 270, w: 60, h: 40 },
            { name: 'A-108', x: 390, y: 270, w: 60, h: 40 },
            { name: 'A-109', x: 560, y: 120, w: 70, h: 50 },
            { name: 'A-110', x: 560, y: 180, w: 70, h: 50 }
        ];
    } else if (floorNum === 2) {
        layout.leftCorridor = { x: 50, y: 100, w: 200, h: 400 };
        layout.rightCorridor = { x: 550, y: 100, w: 200, h: 400 };
        layout.center = { x: 300, y: 200, w: 200, h: 200 };
        
        layout.rooms = [
            { name: 'A-201', x: 60, y: 120, w: 70, h: 40 },
            { name: 'A-202', x: 60, y: 170, w: 70, h: 40 },
            { name: 'A-203', x: 60, y: 220, w: 70, h: 40 },
            { name: 'A-204', x: 60, y: 270, w: 70, h: 40 },
            { name: 'A-205', x: 60, y: 320, w: 70, h: 40 },
            { name: 'A-206', x: 140, y: 320, w: 70, h: 40 },
            { name: 'A-207', x: 60, y: 370, w: 70, h: 40 },
            { name: 'A-208', x: 60, y: 420, w: 70, h: 40 },
            { name: 'A-209', x: 320, y: 220, w: 60, h: 40 },
            { name: 'A-210', x: 390, y: 220, w: 60, h: 40 },
            { name: 'A-211', x: 320, y: 270, w: 60, h: 40 },
            { name: 'A-212', x: 390, y: 270, w: 60, h: 40 },
            { name: 'A-213', x: 560, y: 120, w: 70, h: 40 },
            { name: 'A-214', x: 560, y: 170, w: 70, h: 40 },
            { name: 'A-215', x: 560, y: 220, w: 70, h: 40 },
            { name: 'A-216', x: 560, y: 270, w: 70, h: 40 }
        ];
    } else if (floorNum === 3) {
        layout.leftCorridor = { x: 50, y: 100, w: 200, h: 400 };
        layout.rightCorridor = { x: 550, y: 100, w: 200, h: 400 };
        layout.center = { x: 300, y: 200, w: 200, h: 200 };
        
        layout.rooms = [
            { name: 'A-301', x: 60, y: 120, w: 70, h: 50 },
            { name: 'A-302', x: 60, y: 180, w: 70, h: 50 },
            { name: 'A-303', x: 60, y: 240, w: 70, h: 50 },
            { name: 'A-304', x: 60, y: 300, w: 70, h: 50 },
            { name: 'A-305', x: 60, y: 360, w: 70, h: 50 },
            { name: 'A-306', x: 320, y: 220, w: 60, h: 40 },
            { name: 'A-307', x: 390, y: 220, w: 60, h: 40 },
            { name: 'A-308', x: 320, y: 270, w: 60, h: 40 },
            { name: 'A-309', x: 560, y: 120, w: 60, h: 40 },
            { name: 'A-310', x: 630, y: 120, w: 60, h: 40 },
            { name: 'A-311', x: 560, y: 170, w: 60, h: 40 },
            { name: 'A-312', x: 630, y: 170, w: 60, h: 40 }
        ];
    }
    
    return layout;
}

function getBlockNLayout(floorNum) {
    const width = 800;
    const height = 600;
    
    const layout = {
        lobby: { x: width/2 - 80, y: height/2 - 60, w: 160, h: 120 },
        leftCorridor: null,
        rightCorridor: null,
        center: null,
        rooms: []
    };
    
    if (floorNum === 0) {
        layout.leftCorridor = { x: 50, y: 100, w: 200, h: 400 };
        layout.rightCorridor = { x: 550, y: 100, w: 200, h: 400 };
        layout.center = { x: 300, y: 200, w: 200, h: 200 };
        
        layout.rooms = [
            { name: 'N-001', x: 60, y: 120, w: 80, h: 60 },
            { name: 'N-002', x: 60, y: 200, w: 80, h: 60 },
            { name: 'N-003', x: 60, y: 280, w: 80, h: 60 },
            { name: 'N-004', x: 60, y: 360, w: 80, h: 60 },
            { name: 'N-005', x: 320, y: 220, w: 80, h: 60 },
            { name: 'N-006', x: 320, y: 300, w: 80, h: 60 },
            { name: 'N-007', x: 560, y: 120, w: 80, h: 60 },
            { name: 'N-008', x: 560, y: 200, w: 80, h: 60 },
            { name: 'N-009', x: 560, y: 280, w: 80, h: 60 },
            { name: 'N-010', x: 560, y: 360, w: 80, h: 60 }
        ];
    } else if (floorNum === 1) {
        layout.leftCorridor = { x: 50, y: 100, w: 200, h: 400 };
        layout.rightCorridor = { x: 550, y: 100, w: 200, h: 400 };
        layout.center = { x: 300, y: 200, w: 200, h: 200 };
        
        layout.rooms = [
            { name: 'N-101', x: 60, y: 120, w: 70, h: 50 },
            { name: 'N-102', x: 60, y: 180, w: 70, h: 50 },
            { name: 'N-103', x: 60, y: 240, w: 70, h: 50 },
            { name: 'N-104', x: 60, y: 300, w: 70, h: 50 },
            { name: 'N-105', x: 320, y: 220, w: 60, h: 40 },
            { name: 'N-106', x: 390, y: 220, w: 60, h: 40 },
            { name: 'N-107', x: 320, y: 270, w: 60, h: 40 },
            { name: 'N-108', x: 390, y: 270, w: 60, h: 40 },
            { name: 'N-109', x: 560, y: 120, w: 70, h: 50 },
            { name: 'N-110', x: 560, y: 180, w: 70, h: 50 }
        ];
    } else if (floorNum === 2) {
        layout.leftCorridor = { x: 50, y: 100, w: 200, h: 400 };
        layout.rightCorridor = { x: 550, y: 100, w: 200, h: 400 };
        layout.center = { x: 300, y: 200, w: 200, h: 200 };
        
        layout.rooms = [
            { name: 'N-201', x: 60, y: 120, w: 70, h: 40 },
            { name: 'N-202', x: 60, y: 170, w: 70, h: 40 },
            { name: 'N-203', x: 60, y: 220, w: 70, h: 40 },
            { name: 'N-204', x: 60, y: 270, w: 70, h: 40 },
            { name: 'N-205', x: 60, y: 320, w: 70, h: 40 },
            { name: 'N-206', x: 140, y: 320, w: 70, h: 40 },
            { name: 'N-207', x: 60, y: 370, w: 70, h: 40 },
            { name: 'N-208', x: 60, y: 420, w: 70, h: 40 },
            { name: 'N-209', x: 320, y: 220, w: 60, h: 40 },
            { name: 'N-210', x: 390, y: 220, w: 60, h: 40 },
            { name: 'N-211', x: 320, y: 270, w: 60, h: 40 },
            { name: 'N-212', x: 390, y: 270, w: 60, h: 40 },
            { name: 'N-213', x: 560, y: 120, w: 70, h: 40 },
            { name: 'N-214', x: 560, y: 170, w: 70, h: 40 },
            { name: 'N-215', x: 560, y: 220, w: 70, h: 40 },
            { name: 'N-216', x: 560, y: 270, w: 70, h: 40 }
        ];
    } else if (floorNum === 3) {
        layout.leftCorridor = { x: 50, y: 100, w: 200, h: 400 };
        layout.rightCorridor = { x: 550, y: 100, w: 200, h: 400 };
        layout.center = { x: 300, y: 200, w: 200, h: 200 };
        
        layout.rooms = [
            { name: 'N-301', x: 60, y: 120, w: 70, h: 50 },
            { name: 'N-302', x: 60, y: 180, w: 70, h: 50 },
            { name: 'N-303', x: 60, y: 240, w: 70, h: 50 },
            { name: 'N-304', x: 60, y: 300, w: 70, h: 50 },
            { name: 'N-305', x: 60, y: 360, w: 70, h: 50 },
            { name: 'N-306', x: 320, y: 220, w: 60, h: 40 },
            { name: 'N-307', x: 390, y: 220, w: 60, h: 40 },
            { name: 'N-308', x: 320, y: 270, w: 60, h: 40 },
            { name: 'N-309', x: 560, y: 120, w: 60, h: 40 },
            { name: 'N-310', x: 630, y: 120, w: 60, h: 40 },
            { name: 'N-311', x: 560, y: 170, w: 60, h: 40 },
            { name: 'N-312', x: 630, y: 170, w: 60, h: 40 }
        ];
    }
    
    return layout;
}

function getBlockPLayout(floorNum) {
    const width = 800;
    const height = 600;
    
    const layout = {
        lobby: { x: width/2 - 80, y: height/2 - 60, w: 160, h: 120 },
        leftCorridor: null,
        rightCorridor: null,
        center: null,
        rooms: []
    };
    
    if (floorNum === 0) {
        layout.leftCorridor = { x: 50, y: 100, w: 200, h: 400 };
        layout.rightCorridor = { x: 550, y: 100, w: 200, h: 400 };
        layout.center = { x: 300, y: 200, w: 200, h: 200 };
        
        layout.rooms = [
            { name: 'P-001', x: 60, y: 120, w: 80, h: 60 },
            { name: 'P-002', x: 60, y: 200, w: 80, h: 60 },
            { name: 'P-003', x: 60, y: 280, w: 80, h: 60 },
            { name: 'P-004', x: 60, y: 360, w: 80, h: 60 },
            { name: 'P-005', x: 320, y: 220, w: 80, h: 60 },
            { name: 'P-006', x: 320, y: 300, w: 80, h: 60 },
            { name: 'P-007', x: 560, y: 120, w: 80, h: 60 },
            { name: 'P-008', x: 560, y: 200, w: 80, h: 60 },
            { name: 'P-009', x: 560, y: 280, w: 80, h: 60 },
            { name: 'P-010', x: 560, y: 360, w: 80, h: 60 }
        ];
    } else if (floorNum === 1) {
        layout.leftCorridor = { x: 50, y: 100, w: 200, h: 400 };
        layout.rightCorridor = { x: 550, y: 100, w: 200, h: 400 };
        layout.center = { x: 300, y: 200, w: 200, h: 200 };
        
        layout.rooms = [
            { name: 'P-101', x: 60, y: 120, w: 70, h: 50 },
            { name: 'P-102', x: 60, y: 180, w: 70, h: 50 },
            { name: 'P-103', x: 60, y: 240, w: 70, h: 50 },
            { name: 'P-104', x: 60, y: 300, w: 70, h: 50 },
            { name: 'P-105', x: 320, y: 220, w: 60, h: 40 },
            { name: 'P-106', x: 390, y: 220, w: 60, h: 40 },
            { name: 'P-107', x: 320, y: 270, w: 60, h: 40 },
            { name: 'P-108', x: 390, y: 270, w: 60, h: 40 },
            { name: 'P-109', x: 560, y: 120, w: 70, h: 50 },
            { name: 'P-110', x: 560, y: 180, w: 70, h: 50 }
        ];
    } else if (floorNum === 2) {
        layout.leftCorridor = { x: 50, y: 100, w: 200, h: 400 };
        layout.rightCorridor = { x: 550, y: 100, w: 200, h: 400 };
        layout.center = { x: 300, y: 200, w: 200, h: 200 };
        
        layout.rooms = [
            { name: 'P-201', x: 60, y: 120, w: 70, h: 40 },
            { name: 'P-202', x: 60, y: 170, w: 70, h: 40 },
            { name: 'P-203', x: 60, y: 220, w: 70, h: 40 },
            { name: 'P-204', x: 60, y: 270, w: 70, h: 40 },
            { name: 'P-205', x: 60, y: 320, w: 70, h: 40 },
            { name: 'P-206', x: 140, y: 320, w: 70, h: 40 },
            { name: 'P-207', x: 60, y: 370, w: 70, h: 40 },
            { name: 'P-208', x: 60, y: 420, w: 70, h: 40 },
            { name: 'P-209', x: 320, y: 220, w: 60, h: 40 },
            { name: 'P-210', x: 390, y: 220, w: 60, h: 40 },
            { name: 'P-211', x: 320, y: 270, w: 60, h: 40 },
            { name: 'P-212', x: 390, y: 270, w: 60, h: 40 },
            { name: 'P-213', x: 560, y: 120, w: 70, h: 40 },
            { name: 'P-214', x: 560, y: 170, w: 70, h: 40 },
            { name: 'P-215', x: 560, y: 220, w: 70, h: 40 },
            { name: 'P-216', x: 560, y: 270, w: 70, h: 40 }
        ];
    } else if (floorNum === 3) {
        layout.leftCorridor = { x: 50, y: 100, w: 200, h: 400 };
        layout.rightCorridor = { x: 550, y: 100, w: 200, h: 400 };
        layout.center = { x: 300, y: 200, w: 200, h: 200 };
        
        layout.rooms = [
            { name: 'P-301', x: 60, y: 120, w: 70, h: 50 },
            { name: 'P-302', x: 60, y: 180, w: 70, h: 50 },
            { name: 'P-303', x: 60, y: 240, w: 70, h: 50 },
            { name: 'P-304', x: 60, y: 300, w: 70, h: 50 },
            { name: 'P-305', x: 60, y: 360, w: 70, h: 50 },
            { name: 'P-306', x: 320, y: 220, w: 60, h: 40 },
            { name: 'P-307', x: 390, y: 220, w: 60, h: 40 },
            { name: 'P-308', x: 320, y: 270, w: 60, h: 40 },
            { name: 'P-309', x: 560, y: 120, w: 60, h: 40 },
            { name: 'P-310', x: 630, y: 120, w: 60, h: 40 },
            { name: 'P-311', x: 560, y: 170, w: 60, h: 40 },
            { name: 'P-312', x: 630, y: 170, w: 60, h: 40 }
        ];
    }
    
    return layout;
}

function drawBlockAFloorPlan(ctx, floorNum, path, destination, preference) {
    const width = 800;
    const height = 600;
    
    console.log('Drawing Block A floor plan for floor:', floorNum);
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background with border
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Draw border
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, width - 4, height - 4);
    
    // Draw title at top
    ctx.fillStyle = '#212529';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Block A - Floor ${floorNum === 0 ? 'Ground' : floorNum}`, width/2, 30);
    
    // Define layout based on floor
    let layout = getBlockALayout(floorNum);
    
    if (!layout) {
        console.error('Layout not found for floor:', floorNum);
        ctx.fillStyle = '#dc3545';
        ctx.font = '16px Arial';
        ctx.fillText('Layout not available for this floor', width/2, height/2);
        return;
    }
    
    // Draw lobby, corridors, rooms, and path (same structure as Block B)
    drawCommonFloorElements(ctx, layout, preference, destination);
    
    // Draw path
    drawPathOnDiagram(ctx, path, layout, destination, preference);
    
    // Draw destination marker
    const destRoom = layout.rooms?.find(r => r.name === destination || r.name.toUpperCase() === destination.toUpperCase());
    if (destRoom) {
        ctx.fillStyle = '#28a745';
        ctx.beginPath();
        ctx.arc(destRoom.x + destRoom.w/2, destRoom.y - 10, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('END', destRoom.x + destRoom.w/2, destRoom.y - 10 + 3);
    }
}

function drawBlockNFloorPlan(ctx, floorNum, path, destination, preference) {
    const width = 800;
    const height = 600;
    
    console.log('Drawing Block N floor plan for floor:', floorNum);
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background with border
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Draw border
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, width - 4, height - 4);
    
    // Draw title at top
    ctx.fillStyle = '#212529';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Block N - Floor ${floorNum === 0 ? 'Ground' : floorNum}`, width/2, 30);
    
    // Define layout based on floor
    let layout = getBlockNLayout(floorNum);
    
    if (!layout) {
        console.error('Layout not found for floor:', floorNum);
        ctx.fillStyle = '#dc3545';
        ctx.font = '16px Arial';
        ctx.fillText('Layout not available for this floor', width/2, height/2);
        return;
    }
    
    // Draw lobby, corridors, rooms, and path
    drawCommonFloorElements(ctx, layout, preference, destination);
    
    // Draw path
    drawPathOnDiagram(ctx, path, layout, destination, preference);
    
    // Draw destination marker
    const destRoom = layout.rooms?.find(r => r.name === destination || r.name.toUpperCase() === destination.toUpperCase());
    if (destRoom) {
        ctx.fillStyle = '#28a745';
        ctx.beginPath();
        ctx.arc(destRoom.x + destRoom.w/2, destRoom.y - 10, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('END', destRoom.x + destRoom.w/2, destRoom.y - 10 + 3);
    }
}

function drawBlockPFloorPlan(ctx, floorNum, path, destination, preference) {
    const width = 800;
    const height = 600;
    
    console.log('Drawing Block P floor plan for floor:', floorNum);
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background with border
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Draw border
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, width - 4, height - 4);
    
    // Draw title at top
    ctx.fillStyle = '#212529';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Block P - Floor ${floorNum === 0 ? 'Ground' : floorNum}`, width/2, 30);
    
    // Define layout based on floor
    let layout = getBlockPLayout(floorNum);
    
    if (!layout) {
        console.error('Layout not found for floor:', floorNum);
        ctx.fillStyle = '#dc3545';
        ctx.font = '16px Arial';
        ctx.fillText('Layout not available for this floor', width/2, height/2);
        return;
    }
    
    // Draw lobby, corridors, rooms, and path
    drawCommonFloorElements(ctx, layout, preference, destination);
    
    // Draw path
    drawPathOnDiagram(ctx, path, layout, destination, preference);
    
    // Draw destination marker
    const destRoom = layout.rooms?.find(r => r.name === destination || r.name.toUpperCase() === destination.toUpperCase());
    if (destRoom) {
        ctx.fillStyle = '#28a745';
        ctx.beginPath();
        ctx.arc(destRoom.x + destRoom.w/2, destRoom.y - 10, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('END', destRoom.x + destRoom.w/2, destRoom.y - 10 + 3);
    }
}

// Common function to draw floor elements (lobby, corridors, rooms)
function drawCommonFloorElements(ctx, layout, preference, destination = null) {
    const width = 800;
    const height = 600;
    
    // Draw lobby (center)
    ctx.fillStyle = '#e3f2fd';
    ctx.fillRect(layout.lobby.x, layout.lobby.y, layout.lobby.w, layout.lobby.h);
    ctx.strokeStyle = '#2196f3';
    ctx.lineWidth = 3;
    ctx.strokeRect(layout.lobby.x, layout.lobby.y, layout.lobby.w, layout.lobby.h);
    ctx.fillStyle = '#1976d2';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('LOBBY', layout.lobby.x + layout.lobby.w/2, layout.lobby.y + layout.lobby.h/2 + 5);
    
    // Draw lift/stairs with exit indicators
    const liftStairsX = layout.lobby.x + layout.lobby.w/2 - 30;
    const liftStairsY = layout.lobby.y + 10;
    ctx.fillStyle = '#17a2b8';
    ctx.fillRect(liftStairsX, liftStairsY, 60, 40);
    ctx.strokeStyle = '#0d47a1';
    ctx.lineWidth = 2;
    ctx.strokeRect(liftStairsX, liftStairsY, 60, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(preference === 'lift' ? '🛗 LIFT' : '🪜 STAIRS', liftStairsX + 30, liftStairsY + 20);
    ctx.font = '10px Arial';
    ctx.fillText('EXIT', liftStairsX + 30, liftStairsY + 32);
    
    // Draw exit arrows from lift/stairs showing directions
    const exitY = liftStairsY + 50;
    const leftExitX = layout.lobby.x + 20;
    const rightExitX = layout.lobby.x + layout.lobby.w - 20;
    
    // Left exit arrow
    ctx.strokeStyle = '#ff5722';
    ctx.fillStyle = '#ff5722';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(liftStairsX + 30, exitY);
    ctx.lineTo(leftExitX, exitY);
    ctx.stroke();
    // Left arrow head
    ctx.beginPath();
    ctx.moveTo(leftExitX, exitY);
    ctx.lineTo(leftExitX - 8, exitY - 5);
    ctx.lineTo(leftExitX - 8, exitY + 5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Arial';
    ctx.fillText('← LEFT', leftExitX - 25, exitY - 8);
    
    // Right exit arrow
    ctx.strokeStyle = '#ff5722';
    ctx.fillStyle = '#ff5722';
    ctx.beginPath();
    ctx.moveTo(liftStairsX + 30, exitY);
    ctx.lineTo(rightExitX, exitY);
    ctx.stroke();
    // Right arrow head
    ctx.beginPath();
    ctx.moveTo(rightExitX, exitY);
    ctx.lineTo(rightExitX + 8, exitY - 5);
    ctx.lineTo(rightExitX + 8, exitY + 5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Arial';
    ctx.fillText('RIGHT →', rightExitX + 25, exitY - 8);
    
    // Draw left corridor
    if (layout.leftCorridor) {
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(layout.leftCorridor.x, layout.leftCorridor.y, layout.leftCorridor.w, layout.leftCorridor.h);
        ctx.strokeStyle = '#9e9e9e';
        ctx.lineWidth = 1;
        ctx.strokeRect(layout.leftCorridor.x, layout.leftCorridor.y, layout.leftCorridor.w, layout.leftCorridor.h);
        ctx.fillStyle = '#616161';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Left Corridor', layout.leftCorridor.x + 5, layout.leftCorridor.y + 15);
    }
    
    // Draw right corridor
    if (layout.rightCorridor) {
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(layout.rightCorridor.x, layout.rightCorridor.y, layout.rightCorridor.w, layout.rightCorridor.h);
        ctx.strokeStyle = '#9e9e9e';
        ctx.lineWidth = 1;
        ctx.strokeRect(layout.rightCorridor.x, layout.rightCorridor.y, layout.rightCorridor.w, layout.rightCorridor.h);
        ctx.fillStyle = '#616161';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('Right Corridor', layout.rightCorridor.x + layout.rightCorridor.w - 5, layout.rightCorridor.y + 15);
    }
    
    // Draw center area
    if (layout.center) {
        ctx.fillStyle = '#fff3e0';
        ctx.fillRect(layout.center.x, layout.center.y, layout.center.w, layout.center.h);
        ctx.strokeStyle = '#ff9800';
        ctx.lineWidth = 1;
        ctx.strokeRect(layout.center.x, layout.center.y, layout.center.w, layout.center.h);
    }
    
    // Draw rooms
    if (layout.rooms) {
        layout.rooms.forEach((room) => {
            // Check if this is the destination room
            const isDestination = destination && (
                room.name.toUpperCase() === destination.toUpperCase() ||
                room.name.toUpperCase().includes(destination.toUpperCase()) ||
                destination.toUpperCase().includes(room.name.toUpperCase())
            );
            
            ctx.fillStyle = isDestination ? '#28a745' : '#e0e0e0';
            ctx.fillRect(room.x, room.y, room.w, room.h);
            ctx.strokeStyle = isDestination ? '#1b5e20' : '#9e9e9e';
            ctx.lineWidth = isDestination ? 3 : 1;
            ctx.strokeRect(room.x, room.y, room.w, room.h);
            
            // Room label
            ctx.fillStyle = isDestination ? '#ffffff' : '#424242';
            ctx.font = isDestination ? 'bold 10px Arial' : '9px Arial';
            ctx.textAlign = 'center';
            const label = room.name.length > 12 ? room.name.substring(0, 10) + '...' : room.name;
            ctx.fillText(label, room.x + room.w/2, room.y + room.h/2 + 3);
        });
    }
}

function drawPathOnDiagram(ctx, path, layout, destination, preference) {
    if (path.length < 2) return;
    
    console.log('Drawing path:', path, 'Destination:', destination);
    
    const width = 800;
    const height = 600;
    
    // Find destination room first
    const destRoom = layout.rooms?.find(r => {
        const roomName = r.name.toUpperCase();
        const destName = destination.toUpperCase();
        // Exact match
        if (roomName === destName) return true;
        // Partial match
        if (roomName.includes(destName) || destName.includes(roomName)) return true;
        // Match by number (e.g., A-201 matches A-201)
        const roomNum = roomName.match(/-(\d+)/)?.[1];
        const destNum = destName.match(/-(\d+)/)?.[1];
        if (roomNum && destNum && roomNum === destNum) return true;
        return false;
    });
    
    console.log('Destination room found:', destRoom);
    
    // Find where to start (after exiting lift/stairs)
    let startIndex = 0;
    let foundLiftStairs = false;
    
    // Find the lobby point after lift/stairs exit
    for (let i = 0; i < path.length - 1; i++) {
        const current = path[i];
        const next = path[i + 1];
        
        // Start from lobby after exiting lift/stairs
        if ((current.includes('lift') || current.includes('stairs')) && next.includes('lobby')) {
            startIndex = i + 1; // Start from lobby
            foundLiftStairs = true;
            break;
        }
        // Or if we're already at lobby after lift/stairs
        if (current.includes('lobby') && (path[i - 1]?.includes('lift') || path[i - 1]?.includes('stairs'))) {
            startIndex = i;
            foundLiftStairs = true;
            break;
        }
    }
    
    // If no lift/stairs found, start from lobby
    if (!foundLiftStairs) {
        for (let i = 0; i < path.length; i++) {
            if (path[i].includes('lobby')) {
                startIndex = i;
                break;
            }
        }
    }
    
    // Start point - lobby center (exit point from lift/stairs)
    let currentX = layout.lobby.x + layout.lobby.w/2;
    let currentY = layout.lobby.y + 30; // Exit point from lift/stairs
    let stepNumber = 1;
    
    ctx.strokeStyle = '#ffc107';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash([]);
    
    // Draw starting point marker (exit from lift/stairs)
    ctx.fillStyle = '#17a2b8';
    ctx.beginPath();
    ctx.arc(currentX, currentY, 15, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('START', currentX, currentY + 4);
    
    // Draw path segments starting from lobby (after lift/stairs)
    for (let i = startIndex; i < path.length - 1; i++) {
        const current = path[i];
        const next = path[i + 1];
        
        let nextX = currentX;
        let nextY = currentY;
        let stepLabel = '';
        let showDirection = false;
        let direction = '';
        
        // Determine next position and step label based on path step
        if (next.includes('_entrance') || next === 'entrance' || next.includes('lift') || next.includes('stairs')) {
            // Skip entrance and lift/stairs (we're already past them)
            continue;
        } else if (next.includes('lobby') && current.includes('lobby')) {
            // If we're moving within lobby, move to center (skip if we're already starting at lobby)
            if (i > startIndex) {
                nextX = layout.lobby.x + layout.lobby.w/2;
                nextY = layout.lobby.y + layout.lobby.h/2;
                stepLabel = `Step ${stepNumber}: In Lobby`;
            } else {
                // We're starting at lobby, so move to center for next step
                nextX = layout.lobby.x + layout.lobby.w/2;
                nextY = layout.lobby.y + layout.lobby.h/2;
            }
        } else if (next.includes('left_corridor')) {
            nextX = layout.leftCorridor ? layout.leftCorridor.x + layout.leftCorridor.w/2 : currentX;
            nextY = layout.leftCorridor ? layout.leftCorridor.y + layout.leftCorridor.h/2 : currentY;
            stepLabel = `Step ${stepNumber}: Turn LEFT`;
            showDirection = true;
            direction = 'LEFT';
        } else if (next.includes('right_corridor')) {
            nextX = layout.rightCorridor ? layout.rightCorridor.x + layout.rightCorridor.w/2 : currentX;
            nextY = layout.rightCorridor ? layout.rightCorridor.y + layout.rightCorridor.h/2 : currentY;
            stepLabel = `Step ${stepNumber}: Turn RIGHT`;
            showDirection = true;
            direction = 'RIGHT';
        } else if (next.includes('center')) {
            nextX = layout.center ? layout.center.x + layout.center.w/2 : currentX;
            nextY = layout.center ? layout.center.y + layout.center.h/2 : currentY;
            stepLabel = `Step ${stepNumber}: Go to Center`;
        } else if (next.match(/^[ABNP]-/)) {
            // Room destination - find the room with better matching
            const nextNameUpper = next.toUpperCase();
            const room = layout.rooms?.find(r => {
                const roomNameUpper = r.name.toUpperCase();
                // Exact match
                if (roomNameUpper === nextNameUpper) return true;
                // Partial match
                if (roomNameUpper.includes(nextNameUpper) || nextNameUpper.includes(roomNameUpper)) return true;
                // Match by number (e.g., A-201 matches A-201)
                const roomNum = roomNameUpper.match(/-(\d+)/)?.[1];
                const nextNum = nextNameUpper.match(/-(\d+)/)?.[1];
                if (roomNum && nextNum && roomNum === nextNum) return true;
                return false;
            });
            if (room) {
                nextX = room.x + room.w/2;
                nextY = room.y + room.h/2;
                stepLabel = `Step ${stepNumber}: Arrive at ${next}`;
            } else {
                // Room not found, try to approximate based on room number
                const roomNumMatch = next.match(/-(\d+)/);
                if (roomNumMatch) {
                    // Try to find a room with similar number
                    const targetNum = roomNumMatch[1];
                    const similarRoom = layout.rooms?.find(r => {
                        const rNum = r.name.match(/-(\d+)/)?.[1];
                        return rNum && rNum === targetNum;
                    });
                    if (similarRoom) {
                        nextX = similarRoom.x + similarRoom.w/2;
                        nextY = similarRoom.y + similarRoom.h/2;
                    } else {
                        nextX = layout.lobby.x + layout.lobby.w/2;
                        nextY = layout.lobby.y + layout.lobby.h/2;
                    }
                } else {
                    nextX = layout.lobby.x + layout.lobby.w/2;
                    nextY = layout.lobby.y + layout.lobby.h/2;
                }
            }
        } else if (next.includes('floor')) {
            nextX = layout.lobby.x + layout.lobby.w/2;
            nextY = layout.lobby.y + layout.lobby.h/2;
            stepLabel = `Step ${stepNumber}: On Floor`;
        }
        
        // Draw line with smooth curve
        ctx.beginPath();
        ctx.moveTo(currentX, currentY);
        
        // Use quadratic curve for smoother path
        const midX = (currentX + nextX) / 2;
        const midY = (currentY + nextY) / 2;
        ctx.quadraticCurveTo(midX, midY, nextX, nextY);
        ctx.stroke();
        
        // Draw step number circle at waypoint
        ctx.fillStyle = '#ffc107';
        ctx.beginPath();
        ctx.arc(nextX, nextY, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw step number
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(stepNumber.toString(), nextX, nextY + 4);
        
        // Draw direction label for left/right turns
        if (showDirection) {
            ctx.fillStyle = '#ff5722';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            
            // Position label above the waypoint
            const labelY = nextY - 25;
            const labelX = nextX;
            
            // Draw background for text
            const textWidth = ctx.measureText(direction).width;
            ctx.fillStyle = 'rgba(255, 87, 34, 0.9)';
            ctx.fillRect(labelX - textWidth/2 - 5, labelY - 12, textWidth + 10, 20);
            
            // Draw text
            ctx.fillStyle = '#ffffff';
            ctx.fillText(direction, labelX, labelY + 2);
            
            // Draw arrow indicator
            if (direction === 'LEFT') {
                drawDirectionArrow(ctx, labelX, labelY - 15, 'left');
            } else if (direction === 'RIGHT') {
                drawDirectionArrow(ctx, labelX, labelY - 15, 'right');
            }
        }
        
        // Draw arrow at the end of segment
        drawArrow(ctx, currentX, currentY, nextX, nextY);
        
        currentX = nextX;
        currentY = nextY;
        stepNumber++;
    }
    
    // Always draw final path to destination room (use the one we found earlier or find again)
    let finalDestRoom = destRoom;
    if (!finalDestRoom) {
        finalDestRoom = layout.rooms?.find(r => {
            const roomName = r.name.toUpperCase();
            const destName = destination.toUpperCase();
            // Try exact match first
            if (roomName === destName) return true;
            // Try partial match (e.g., "A-201" matches "A-201")
            if (roomName.includes(destName) || destName.includes(roomName)) return true;
            // Try matching just the number part
            const roomNum = roomName.match(/-(\d+)/)?.[1];
            const destNum = destName.match(/-(\d+)/)?.[1];
            return roomNum && destNum && roomNum === destNum;
        });
    }
    
    if (finalDestRoom) {
        const destX = finalDestRoom.x + finalDestRoom.w/2;
        const destY = finalDestRoom.y + finalDestRoom.h/2;
        
        console.log('Drawing final path to room:', finalDestRoom.name, 'at', destX, destY, 'from', currentX, currentY);
        
        // Check if we're already at the destination (within 20 pixels)
        const distance = Math.sqrt(Math.pow(currentX - destX, 2) + Math.pow(currentY - destY, 2));
        
        if (distance > 20) {
            // Draw path to destination room
            ctx.beginPath();
            ctx.moveTo(currentX, currentY);
            
            // Use smooth curve to destination
            const midX = (currentX + destX) / 2;
            const midY = (currentY + destY) / 2;
            ctx.quadraticCurveTo(midX, midY, destX, destY);
            ctx.stroke();
            
            // Draw arrow
            drawArrow(ctx, currentX, currentY, destX, destY);
            
            // Draw final step number at destination
            ctx.fillStyle = '#ffc107';
            ctx.beginPath();
            ctx.arc(destX, destY, 12, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(stepNumber.toString(), destX, destY + 4);
        } else {
            // Already at destination, just draw the step number
            ctx.fillStyle = '#ffc107';
            ctx.beginPath();
            ctx.arc(destX, destY, 12, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(stepNumber.toString(), destX, destY + 4);
        }
    } else {
        console.warn('Destination room not found in layout:', destination);
        // Draw a marker at approximate position if room not found
        ctx.fillStyle = '#dc3545';
        ctx.beginPath();
        ctx.arc(currentX, currentY, 15, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('?', currentX, currentY + 4);
    }
}

function drawDirectionArrow(ctx, x, y, direction) {
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 3;
    
    const arrowSize = 15;
    ctx.beginPath();
    
    if (direction === 'LEFT') {
        ctx.moveTo(x, y);
        ctx.lineTo(x - arrowSize, y);
        ctx.lineTo(x - arrowSize/2, y - arrowSize/2);
        ctx.moveTo(x - arrowSize, y);
        ctx.lineTo(x - arrowSize/2, y + arrowSize/2);
    } else if (direction === 'RIGHT') {
        ctx.moveTo(x, y);
        ctx.lineTo(x + arrowSize, y);
        ctx.lineTo(x + arrowSize/2, y - arrowSize/2);
        ctx.moveTo(x + arrowSize, y);
        ctx.lineTo(x + arrowSize/2, y + arrowSize/2);
    }
    
    ctx.stroke();
}

function drawArrow(ctx, fromX, fromY, toX, toY) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const arrowLength = 15;
    const arrowAngle = Math.PI / 6;
    
    ctx.fillStyle = '#ffc107';
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
        toX - arrowLength * Math.cos(angle - arrowAngle),
        toY - arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.lineTo(
        toX - arrowLength * Math.cos(angle + arrowAngle),
        toY - arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.closePath();
    ctx.fill();
}

function drawGenericFloorPlan(ctx, floorNum, path, destination, preference) {
    // Generic floor plan for other blocks
    const width = 800;
    const height = 600;
    
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Simple layout
    const lobby = { x: width/2 - 80, y: height/2 - 60, w: 160, h: 120 };
    
    ctx.fillStyle = '#e3f2fd';
    ctx.fillRect(lobby.x, lobby.y, lobby.w, lobby.h);
    ctx.strokeStyle = '#2196f3';
    ctx.lineWidth = 2;
    ctx.strokeRect(lobby.x, lobby.y, lobby.w, lobby.h);
    
    ctx.fillStyle = '#1976d2';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Lobby', lobby.x + lobby.w/2, lobby.y + lobby.h/2 + 5);
    
    // Draw simple path
    ctx.strokeStyle = '#ffc107';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(50, height - 50);
    ctx.lineTo(lobby.x + lobby.w/2, lobby.y + lobby.h/2);
    ctx.stroke();
}

