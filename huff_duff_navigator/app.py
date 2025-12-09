from flask import Flask, render_template, request, jsonify, session
import json
import heapq
from functools import wraps

app = Flask(__name__)
app.secret_key = 'huff-duff-secret-key-2024'

# In-memory user database (in production, use a real database)
users_db = {
    'E22CSEU1199': {'name': 'Manan Jain', 'password': '1423', 'type': 'admin'},
    'E22CSEU1200': {'name': 'Jane Smith', 'password': '1200', 'type': 'student'},
    'EMP001': {'name': 'Dr. Sharma', 'password': '0001', 'type': 'employee'},
}

# Store login history and feedback
login_history = []  # List of {enrollment_no, name, login_time, user_type}
user_feedback = []  # List of {enrollment_no, name, feedback, timestamp}

# University building graph structure
# Nodes represent locations (entrances, intersections, classrooms, lifts, stairs)
# Edges represent paths with weights (distance/time)
building_graph = {
    'A': {
        # Entrance connections
        'A_entrance': {'A_lift_1': 5, 'A_stairs_1': 3, 'A_floor_0_lobby': 2},
        'entrance': {'A_lift_1': 5, 'A_stairs_1': 3, 'A_floor_0_lobby': 2},  # Alias for compatibility
        
        # Lift and Stairs connections to all floors
        'A_lift_1': {'A_floor_0_lobby': 1, 'A_floor_1_lobby': 2, 'A_floor_2_lobby': 4, 'A_floor_3_lobby': 6, 'A_entrance': 5, 'entrance': 5},
        'A_stairs_1': {'A_floor_0_lobby': 1, 'A_floor_1_lobby': 1, 'A_floor_2_lobby': 3, 'A_floor_3_lobby': 5, 'A_entrance': 3, 'entrance': 3},
        'A_stairs_2': {'A_floor_0_lobby': 1, 'A_floor_1_lobby': 1, 'A_floor_2_lobby': 3, 'A_floor_3_lobby': 5},
        
        # GROUND FLOOR (0)
        'A_floor_0_lobby': {
            'A_floor_0_left_corridor': 3, 'A_floor_0_right_corridor': 3, 'A_floor_0_center': 2,
            'A_lift_1': 1, 'A_stairs_1': 1, 'A_stairs_2': 1, 'A_entrance': 2, 'entrance': 2
        },
        'A_floor_0_left_corridor': {
            'A_floor_0_lobby': 3, 'A-001': 2, 'A-002': 3, 'A-003': 4, 'A-004': 5
        },
        'A_floor_0_center': {
            'A_floor_0_lobby': 2, 'A-005': 2, 'A-006': 3
        },
        'A_floor_0_right_corridor': {
            'A_floor_0_lobby': 3, 'A-007': 2, 'A-008': 3, 'A-009': 4, 'A-010': 5
        },
        'A-001': {'A_floor_0_left_corridor': 2}, 'A-002': {'A_floor_0_left_corridor': 3},
        'A-003': {'A_floor_0_left_corridor': 4}, 'A-004': {'A_floor_0_left_corridor': 5},
        'A-005': {'A_floor_0_center': 2}, 'A-006': {'A_floor_0_center': 3},
        'A-007': {'A_floor_0_right_corridor': 2}, 'A-008': {'A_floor_0_right_corridor': 3},
        'A-009': {'A_floor_0_right_corridor': 4}, 'A-010': {'A_floor_0_right_corridor': 5},
        
        # FIRST FLOOR (1)
        'A_floor_1_lobby': {
            'A_floor_1_left_corridor': 3, 'A_floor_1_right_corridor': 3, 'A_floor_1_center': 2,
            'A_lift_1': 2, 'A_stairs_1': 1, 'A_stairs_2': 1
        },
        'A_floor_1_left_corridor': {
            'A_floor_1_lobby': 3, 'A-101': 2, 'A-102': 3, 'A-103': 4, 'A-104': 5
        },
        'A_floor_1_center': {
            'A_floor_1_lobby': 2, 'A-105': 2, 'A-106': 3, 'A-107': 4, 'A-108': 5
        },
        'A_floor_1_right_corridor': {
            'A_floor_1_lobby': 3, 'A-109': 2, 'A-110': 3
        },
        'A-101': {'A_floor_1_left_corridor': 2}, 'A-102': {'A_floor_1_left_corridor': 3},
        'A-103': {'A_floor_1_left_corridor': 4}, 'A-104': {'A_floor_1_left_corridor': 5},
        'A-105': {'A_floor_1_center': 2}, 'A-106': {'A_floor_1_center': 3},
        'A-107': {'A_floor_1_center': 4}, 'A-108': {'A_floor_1_center': 5},
        'A-109': {'A_floor_1_right_corridor': 2}, 'A-110': {'A_floor_1_right_corridor': 3},
        
        # SECOND FLOOR (2)
        'A_floor_2_lobby': {
            'A_floor_2_left_corridor': 3, 'A_floor_2_right_corridor': 3, 'A_floor_2_center': 2,
            'A_lift_1': 2, 'A_stairs_1': 1, 'A_stairs_2': 1
        },
        'A_floor_2_left_corridor': {
            'A_floor_2_lobby': 3, 'A-201': 2, 'A-202': 3, 'A-203': 4, 'A-204': 5,
            'A-205': 6, 'A-206': 7, 'A-207': 8, 'A-208': 9
        },
        'A_floor_2_center': {
            'A_floor_2_lobby': 2, 'A-209': 2, 'A-210': 3, 'A-211': 4, 'A-212': 5
        },
        'A_floor_2_right_corridor': {
            'A_floor_2_lobby': 3, 'A-213': 2, 'A-214': 3, 'A-215': 4, 'A-216': 5
        },
        'A-201': {'A_floor_2_left_corridor': 2}, 'A-202': {'A_floor_2_left_corridor': 3},
        'A-203': {'A_floor_2_left_corridor': 4}, 'A-204': {'A_floor_2_left_corridor': 5},
        'A-205': {'A_floor_2_left_corridor': 6}, 'A-206': {'A_floor_2_left_corridor': 7},
        'A-207': {'A_floor_2_left_corridor': 8}, 'A-208': {'A_floor_2_left_corridor': 9},
        'A-209': {'A_floor_2_center': 2}, 'A-210': {'A_floor_2_center': 3},
        'A-211': {'A_floor_2_center': 4}, 'A-212': {'A_floor_2_center': 5},
        'A-213': {'A_floor_2_right_corridor': 2}, 'A-214': {'A_floor_2_right_corridor': 3},
        'A-215': {'A_floor_2_right_corridor': 4}, 'A-216': {'A_floor_2_right_corridor': 5},
        
        # THIRD FLOOR (3)
        'A_floor_3_lobby': {
            'A_floor_3_left_corridor': 3, 'A_floor_3_right_corridor': 3, 'A_floor_3_center': 2,
            'A_lift_1': 2, 'A_stairs_1': 1, 'A_stairs_2': 1
        },
        'A_floor_3_left_corridor': {
            'A_floor_3_lobby': 3, 'A-301': 2, 'A-302': 3, 'A-303': 4, 'A-304': 5, 'A-305': 6
        },
        'A_floor_3_center': {
            'A_floor_3_lobby': 2, 'A-306': 2, 'A-307': 3, 'A-308': 4
        },
        'A_floor_3_right_corridor': {
            'A_floor_3_lobby': 3, 'A-309': 2, 'A-310': 3, 'A-311': 4, 'A-312': 5
        },
        'A-301': {'A_floor_3_left_corridor': 2}, 'A-302': {'A_floor_3_left_corridor': 3},
        'A-303': {'A_floor_3_left_corridor': 4}, 'A-304': {'A_floor_3_left_corridor': 5},
        'A-305': {'A_floor_3_left_corridor': 6},
        'A-306': {'A_floor_3_center': 2}, 'A-307': {'A_floor_3_center': 3}, 'A-308': {'A_floor_3_center': 4},
        'A-309': {'A_floor_3_right_corridor': 2}, 'A-310': {'A_floor_3_right_corridor': 3},
        'A-311': {'A_floor_3_right_corridor': 4}, 'A-312': {'A_floor_3_right_corridor': 5},
    },
    'B': {
        # Entrance connections (B_entrance is the main entrance)
        'B_entrance': {'B_lift_1': 5, 'B_stairs_1': 3, 'B_floor_0_lobby': 2},
        'entrance': {'B_lift_1': 5, 'B_stairs_1': 3, 'B_floor_0_lobby': 2},  # Alias for compatibility
        
        # Lift and Stairs connections to all floors
        'B_lift_1': {'B_floor_0_lobby': 1, 'B_floor_1_lobby': 2, 'B_floor_2_lobby': 4, 'B_floor_3_lobby': 6, 'B_entrance': 5, 'entrance': 5},
        'B_stairs_1': {'B_floor_0_lobby': 1, 'B_floor_1_lobby': 1, 'B_floor_2_lobby': 3, 'B_floor_3_lobby': 5, 'B_entrance': 3, 'entrance': 3},
        'B_stairs_2': {'B_floor_0_lobby': 1, 'B_floor_1_lobby': 1, 'B_floor_2_lobby': 3, 'B_floor_3_lobby': 5},  # Second staircase
        
        # GROUND FLOOR (0) - Based on actual floor plan
        'B_floor_0_lobby': {
            'B_floor_0_left_corridor': 3, 'B_floor_0_right_corridor': 3, 'B_floor_0_center': 2,
            'B_lift_1': 1, 'B_stairs_1': 1, 'B_stairs_2': 1, 'B_entrance': 2, 'entrance': 2
        },
        'B_floor_0_left_corridor': {
            'B_floor_0_lobby': 3, 'B-Server-Room': 2, 'B-UPS': 3, 'B-IT-Room': 4, 'B-Pharmacy': 5
        },
        'B_floor_0_center': {
            'B_floor_0_lobby': 2, 'B-Museum': 2, 'B-Moot-Court-Hall': 3, 'B-Registrar-office': 4
        },
        'B_floor_0_right_corridor': {
            'B_floor_0_lobby': 3, 'B-Tertiary-Room': 2, 'B-Office-Area-1': 3, 'B-Admission-Lounge': 4, 'B-ATM': 5
        },
        'B-Server-Room': {'B_floor_0_left_corridor': 2},
        'B-UPS': {'B_floor_0_left_corridor': 3},
        'B-IT-Room': {'B_floor_0_left_corridor': 4},
        'B-Pharmacy': {'B_floor_0_left_corridor': 5},
        'B-Museum': {'B_floor_0_center': 2},
        'B-Moot-Court-Hall': {'B_floor_0_center': 3},
        'B-Registrar-office': {'B_floor_0_center': 4},
        'B-Tertiary-Room': {'B_floor_0_right_corridor': 2},
        'B-Office-Area-1': {'B_floor_0_right_corridor': 3},
        'B-Admission-Lounge': {'B_floor_0_right_corridor': 4},
        'B-ATM': {'B_floor_0_right_corridor': 5},
        
        # FIRST FLOOR (1) - Based on actual floor plan
        'B_floor_1_lobby': {
            'B_floor_1_left_corridor': 3, 'B_floor_1_right_corridor': 3, 'B_floor_1_center': 2,
            'B_lift_1': 2, 'B_stairs_1': 1, 'B_stairs_2': 1
        },
        'B_floor_1_left_corridor': {
            'B_floor_1_lobby': 3, 'B-LA-107': 2, 'B-LA-108': 3, 'B-LA-109': 4, 'B-LA-110': 5
        },
        'B_floor_1_center': {
            'B_floor_1_lobby': 2, 'B-LA-101': 2, 'B-LA-102': 3, 'B-LA-103': 4, 'B-LA-104': 5, 'B-LA-105': 6
        },
        'B_floor_1_right_corridor': {
            'B_floor_1_lobby': 3, 'B-LA-106-D': 2, 'B-LH-102': 3
        },
        'B-LA-101': {'B_floor_1_center': 2},
        'B-LA-102': {'B_floor_1_center': 3},
        'B-LA-103': {'B_floor_1_center': 4},
        'B-LA-104': {'B_floor_1_center': 5},
        'B-LA-105': {'B_floor_1_center': 6},
        'B-LA-106-D': {'B_floor_1_right_corridor': 2},
        'B-LH-102': {'B_floor_1_right_corridor': 3},
        'B-LA-107': {'B_floor_1_left_corridor': 2},
        'B-LA-108': {'B_floor_1_left_corridor': 3},
        'B-LA-109': {'B_floor_1_left_corridor': 4},
        'B-LA-110': {'B_floor_1_left_corridor': 5},
        
        # SECOND FLOOR (2) - Based on actual floor plan with left/right corridors
        'B_floor_2_lobby': {
            'B_floor_2_left_corridor': 3, 'B_floor_2_right_corridor': 3, 'B_floor_2_center': 2,
            'B_lift_1': 2, 'B_stairs_1': 1, 'B_stairs_2': 1
        },
        'B_floor_2_left_corridor': {
            'B_floor_2_lobby': 3, 'B-LA-207': 2, 'B-LA-208': 3, 'B-LA-209': 4, 'B-LA-210': 5,
            'B-LA-211-A': 6, 'B-LA-211-B': 7, 'B-LA-212': 8, 'B-LA-213': 9, 'B-LA-214': 10, 'B-LA-215': 11
        },
        'B_floor_2_center': {
            'B_floor_2_lobby': 2, 'B-LA-216': 2, 'B-TR-217': 3, 'B-TR-218': 4, 'B-TR-221': 5, 'B-TR-222': 6, 'B-TR-223': 7
        },
        'B_floor_2_right_corridor': {
            'B_floor_2_lobby': 3, 'B-LA-202-A': 2, 'B-LA-202-B': 3, 'B-LA-203-A': 4, 'B-LA-204': 5,
            'B-LA-205': 6, 'B-LA-206': 7, 'B-CA-219': 8, 'B-CA-220': 9
        },
        'B-LA-202-A': {'B_floor_2_right_corridor': 2},
        'B-LA-202-B': {'B_floor_2_right_corridor': 3},
        'B-LA-203-A': {'B_floor_2_right_corridor': 4},
        'B-LA-204': {'B_floor_2_right_corridor': 5},
        'B-LA-205': {'B_floor_2_right_corridor': 6},
        'B-LA-206': {'B_floor_2_right_corridor': 7},
        'B-CA-219': {'B_floor_2_right_corridor': 8},
        'B-CA-220': {'B_floor_2_right_corridor': 9},
        'B-LA-207': {'B_floor_2_left_corridor': 2},
        'B-LA-208': {'B_floor_2_left_corridor': 3},
        'B-LA-209': {'B_floor_2_left_corridor': 4},
        'B-LA-210': {'B_floor_2_left_corridor': 5},
        'B-LA-211-A': {'B_floor_2_left_corridor': 6},
        'B-LA-211-B': {'B_floor_2_left_corridor': 7},
        'B-LA-212': {'B_floor_2_left_corridor': 8},
        'B-LA-213': {'B_floor_2_left_corridor': 9},
        'B-LA-214': {'B_floor_2_left_corridor': 10},
        'B-LA-215': {'B_floor_2_left_corridor': 11},
        'B-LA-216': {'B_floor_2_center': 2},
        'B-TR-217': {'B_floor_2_center': 3},
        'B-TR-218': {'B_floor_2_center': 4},
        'B-TR-221': {'B_floor_2_center': 5},
        'B-TR-222': {'B_floor_2_center': 6},
        'B-TR-223': {'B_floor_2_center': 7},
        
        # THIRD FLOOR (3) - Based on actual floor plan
        'B_floor_3_lobby': {
            'B_floor_3_left_corridor': 3, 'B_floor_3_right_corridor': 3, 'B_floor_3_center': 2,
            'B_lift_1': 2, 'B_stairs_1': 1, 'B_stairs_2': 1
        },
        'B_floor_3_left_corridor': {
            'B_floor_3_lobby': 3, 'B-LA-301': 2, 'B-LA-303': 3, 'B-LA-304': 4, 'B-LA-305': 5, 'B-LA-307': 6
        },
        'B_floor_3_center': {
            'B_floor_3_lobby': 2, 'B-TR-301': 2, 'B-TR-302': 3, 'B-TR-307': 4
        },
        'B_floor_3_right_corridor': {
            'B_floor_3_lobby': 3, 'B-CA-302-A': 2, 'B-CA-302-B': 3, 'B-CA-303': 4, 'B-CA-304': 5,
            'B-CA-305': 6, 'B-CA-306': 7, 'B-CA-306-A': 8, 'B-CA-306-B': 9, 'B-CA-308': 10,
            'B-CA-309': 11, 'B-CA-310': 12, 'B-CA-311': 13, 'B-CA-312': 14
        },
        'B-LA-301': {'B_floor_3_left_corridor': 2},
        'B-LA-303': {'B_floor_3_left_corridor': 3},
        'B-LA-304': {'B_floor_3_left_corridor': 4},
        'B-LA-305': {'B_floor_3_left_corridor': 5},
        'B-LA-307': {'B_floor_3_left_corridor': 6},
        'B-TR-301': {'B_floor_3_center': 2},
        'B-TR-302': {'B_floor_3_center': 3},
        'B-TR-307': {'B_floor_3_center': 4},
        'B-CA-302-A': {'B_floor_3_right_corridor': 2},
        'B-CA-302-B': {'B_floor_3_right_corridor': 3},
        'B-CA-303': {'B_floor_3_right_corridor': 4},
        'B-CA-304': {'B_floor_3_right_corridor': 5},
        'B-CA-305': {'B_floor_3_right_corridor': 6},
        'B-CA-306': {'B_floor_3_right_corridor': 7},
        'B-CA-306-A': {'B_floor_3_right_corridor': 8},
        'B-CA-306-B': {'B_floor_3_right_corridor': 9},
        'B-CA-308': {'B_floor_3_right_corridor': 10},
        'B-CA-309': {'B_floor_3_right_corridor': 11},
        'B-CA-310': {'B_floor_3_right_corridor': 12},
        'B-CA-311': {'B_floor_3_right_corridor': 13},
        'B-CA-312': {'B_floor_3_right_corridor': 14},
    },
    'N': {
        # Entrance connections
        'N_entrance': {'N_lift_1': 5, 'N_stairs_1': 3, 'N_floor_0_lobby': 2},
        'entrance': {'N_lift_1': 5, 'N_stairs_1': 3, 'N_floor_0_lobby': 2},  # Alias for compatibility
        
        # Lift and Stairs connections to all floors
        'N_lift_1': {'N_floor_0_lobby': 1, 'N_floor_1_lobby': 2, 'N_floor_2_lobby': 4, 'N_floor_3_lobby': 6, 'N_entrance': 5, 'entrance': 5},
        'N_stairs_1': {'N_floor_0_lobby': 1, 'N_floor_1_lobby': 1, 'N_floor_2_lobby': 3, 'N_floor_3_lobby': 5, 'N_entrance': 3, 'entrance': 3},
        'N_stairs_2': {'N_floor_0_lobby': 1, 'N_floor_1_lobby': 1, 'N_floor_2_lobby': 3, 'N_floor_3_lobby': 5},
        
        # GROUND FLOOR (0)
        'N_floor_0_lobby': {
            'N_floor_0_left_corridor': 3, 'N_floor_0_right_corridor': 3, 'N_floor_0_center': 2,
            'N_lift_1': 1, 'N_stairs_1': 1, 'N_stairs_2': 1, 'N_entrance': 2, 'entrance': 2
        },
        'N_floor_0_left_corridor': {
            'N_floor_0_lobby': 3, 'N-001': 2, 'N-002': 3, 'N-003': 4, 'N-004': 5
        },
        'N_floor_0_center': {
            'N_floor_0_lobby': 2, 'N-005': 2, 'N-006': 3
        },
        'N_floor_0_right_corridor': {
            'N_floor_0_lobby': 3, 'N-007': 2, 'N-008': 3, 'N-009': 4, 'N-010': 5
        },
        'N-001': {'N_floor_0_left_corridor': 2}, 'N-002': {'N_floor_0_left_corridor': 3},
        'N-003': {'N_floor_0_left_corridor': 4}, 'N-004': {'N_floor_0_left_corridor': 5},
        'N-005': {'N_floor_0_center': 2}, 'N-006': {'N_floor_0_center': 3},
        'N-007': {'N_floor_0_right_corridor': 2}, 'N-008': {'N_floor_0_right_corridor': 3},
        'N-009': {'N_floor_0_right_corridor': 4}, 'N-010': {'N_floor_0_right_corridor': 5},
        
        # FIRST FLOOR (1)
        'N_floor_1_lobby': {
            'N_floor_1_left_corridor': 3, 'N_floor_1_right_corridor': 3, 'N_floor_1_center': 2,
            'N_lift_1': 2, 'N_stairs_1': 1, 'N_stairs_2': 1
        },
        'N_floor_1_left_corridor': {
            'N_floor_1_lobby': 3, 'N-101': 2, 'N-102': 3, 'N-103': 4, 'N-104': 5
        },
        'N_floor_1_center': {
            'N_floor_1_lobby': 2, 'N-105': 2, 'N-106': 3, 'N-107': 4, 'N-108': 5
        },
        'N_floor_1_right_corridor': {
            'N_floor_1_lobby': 3, 'N-109': 2, 'N-110': 3
        },
        'N-101': {'N_floor_1_left_corridor': 2}, 'N-102': {'N_floor_1_left_corridor': 3},
        'N-103': {'N_floor_1_left_corridor': 4}, 'N-104': {'N_floor_1_left_corridor': 5},
        'N-105': {'N_floor_1_center': 2}, 'N-106': {'N_floor_1_center': 3},
        'N-107': {'N_floor_1_center': 4}, 'N-108': {'N_floor_1_center': 5},
        'N-109': {'N_floor_1_right_corridor': 2}, 'N-110': {'N_floor_1_right_corridor': 3},
        
        # SECOND FLOOR (2)
        'N_floor_2_lobby': {
            'N_floor_2_left_corridor': 3, 'N_floor_2_right_corridor': 3, 'N_floor_2_center': 2,
            'N_lift_1': 2, 'N_stairs_1': 1, 'N_stairs_2': 1
        },
        'N_floor_2_left_corridor': {
            'N_floor_2_lobby': 3, 'N-201': 2, 'N-202': 3, 'N-203': 4, 'N-204': 5,
            'N-205': 6, 'N-206': 7, 'N-207': 8, 'N-208': 9
        },
        'N_floor_2_center': {
            'N_floor_2_lobby': 2, 'N-209': 2, 'N-210': 3, 'N-211': 4, 'N-212': 5
        },
        'N_floor_2_right_corridor': {
            'N_floor_2_lobby': 3, 'N-213': 2, 'N-214': 3, 'N-215': 4, 'N-216': 5
        },
        'N-201': {'N_floor_2_left_corridor': 2}, 'N-202': {'N_floor_2_left_corridor': 3},
        'N-203': {'N_floor_2_left_corridor': 4}, 'N-204': {'N_floor_2_left_corridor': 5},
        'N-205': {'N_floor_2_left_corridor': 6}, 'N-206': {'N_floor_2_left_corridor': 7},
        'N-207': {'N_floor_2_left_corridor': 8}, 'N-208': {'N_floor_2_left_corridor': 9},
        'N-209': {'N_floor_2_center': 2}, 'N-210': {'N_floor_2_center': 3},
        'N-211': {'N_floor_2_center': 4}, 'N-212': {'N_floor_2_center': 5},
        'N-213': {'N_floor_2_right_corridor': 2}, 'N-214': {'N_floor_2_right_corridor': 3},
        'N-215': {'N_floor_2_right_corridor': 4}, 'N-216': {'N_floor_2_right_corridor': 5},
        
        # THIRD FLOOR (3)
        'N_floor_3_lobby': {
            'N_floor_3_left_corridor': 3, 'N_floor_3_right_corridor': 3, 'N_floor_3_center': 2,
            'N_lift_1': 2, 'N_stairs_1': 1, 'N_stairs_2': 1
        },
        'N_floor_3_left_corridor': {
            'N_floor_3_lobby': 3, 'N-301': 2, 'N-302': 3, 'N-303': 4, 'N-304': 5, 'N-305': 6
        },
        'N_floor_3_center': {
            'N_floor_3_lobby': 2, 'N-306': 2, 'N-307': 3, 'N-308': 4
        },
        'N_floor_3_right_corridor': {
            'N_floor_3_lobby': 3, 'N-309': 2, 'N-310': 3, 'N-311': 4, 'N-312': 5
        },
        'N-301': {'N_floor_3_left_corridor': 2}, 'N-302': {'N_floor_3_left_corridor': 3},
        'N-303': {'N_floor_3_left_corridor': 4}, 'N-304': {'N_floor_3_left_corridor': 5},
        'N-305': {'N_floor_3_left_corridor': 6},
        'N-306': {'N_floor_3_center': 2}, 'N-307': {'N_floor_3_center': 3}, 'N-308': {'N_floor_3_center': 4},
        'N-309': {'N_floor_3_right_corridor': 2}, 'N-310': {'N_floor_3_right_corridor': 3},
        'N-311': {'N_floor_3_right_corridor': 4}, 'N-312': {'N_floor_3_right_corridor': 5},
    },
    'P': {
        # Entrance connections
        'P_entrance': {'P_lift_1': 5, 'P_stairs_1': 3, 'P_floor_0_lobby': 2},
        'entrance': {'P_lift_1': 5, 'P_stairs_1': 3, 'P_floor_0_lobby': 2},  # Alias for compatibility
        
        # Lift and Stairs connections to all floors
        'P_lift_1': {'P_floor_0_lobby': 1, 'P_floor_1_lobby': 2, 'P_floor_2_lobby': 4, 'P_floor_3_lobby': 6, 'P_entrance': 5, 'entrance': 5},
        'P_stairs_1': {'P_floor_0_lobby': 1, 'P_floor_1_lobby': 1, 'P_floor_2_lobby': 3, 'P_floor_3_lobby': 5, 'P_entrance': 3, 'entrance': 3},
        'P_stairs_2': {'P_floor_0_lobby': 1, 'P_floor_1_lobby': 1, 'P_floor_2_lobby': 3, 'P_floor_3_lobby': 5},
        
        # GROUND FLOOR (0)
        'P_floor_0_lobby': {
            'P_floor_0_left_corridor': 3, 'P_floor_0_right_corridor': 3, 'P_floor_0_center': 2,
            'P_lift_1': 1, 'P_stairs_1': 1, 'P_stairs_2': 1, 'P_entrance': 2, 'entrance': 2
        },
        'P_floor_0_left_corridor': {
            'P_floor_0_lobby': 3, 'P-001': 2, 'P-002': 3, 'P-003': 4, 'P-004': 5
        },
        'P_floor_0_center': {
            'P_floor_0_lobby': 2, 'P-005': 2, 'P-006': 3
        },
        'P_floor_0_right_corridor': {
            'P_floor_0_lobby': 3, 'P-007': 2, 'P-008': 3, 'P-009': 4, 'P-010': 5
        },
        'P-001': {'P_floor_0_left_corridor': 2}, 'P-002': {'P_floor_0_left_corridor': 3},
        'P-003': {'P_floor_0_left_corridor': 4}, 'P-004': {'P_floor_0_left_corridor': 5},
        'P-005': {'P_floor_0_center': 2}, 'P-006': {'P_floor_0_center': 3},
        'P-007': {'P_floor_0_right_corridor': 2}, 'P-008': {'P_floor_0_right_corridor': 3},
        'P-009': {'P_floor_0_right_corridor': 4}, 'P-010': {'P_floor_0_right_corridor': 5},
        
        # FIRST FLOOR (1)
        'P_floor_1_lobby': {
            'P_floor_1_left_corridor': 3, 'P_floor_1_right_corridor': 3, 'P_floor_1_center': 2,
            'P_lift_1': 2, 'P_stairs_1': 1, 'P_stairs_2': 1
        },
        'P_floor_1_left_corridor': {
            'P_floor_1_lobby': 3, 'P-101': 2, 'P-102': 3, 'P-103': 4, 'P-104': 5
        },
        'P_floor_1_center': {
            'P_floor_1_lobby': 2, 'P-105': 2, 'P-106': 3, 'P-107': 4, 'P-108': 5
        },
        'P_floor_1_right_corridor': {
            'P_floor_1_lobby': 3, 'P-109': 2, 'P-110': 3
        },
        'P-101': {'P_floor_1_left_corridor': 2}, 'P-102': {'P_floor_1_left_corridor': 3},
        'P-103': {'P_floor_1_left_corridor': 4}, 'P-104': {'P_floor_1_left_corridor': 5},
        'P-105': {'P_floor_1_center': 2}, 'P-106': {'P_floor_1_center': 3},
        'P-107': {'P_floor_1_center': 4}, 'P-108': {'P_floor_1_center': 5},
        'P-109': {'P_floor_1_right_corridor': 2}, 'P-110': {'P_floor_1_right_corridor': 3},
        
        # SECOND FLOOR (2)
        'P_floor_2_lobby': {
            'P_floor_2_left_corridor': 3, 'P_floor_2_right_corridor': 3, 'P_floor_2_center': 2,
            'P_lift_1': 2, 'P_stairs_1': 1, 'P_stairs_2': 1
        },
        'P_floor_2_left_corridor': {
            'P_floor_2_lobby': 3, 'P-201': 2, 'P-202': 3, 'P-203': 4, 'P-204': 5,
            'P-205': 6, 'P-206': 7, 'P-207': 8, 'P-208': 9
        },
        'P_floor_2_center': {
            'P_floor_2_lobby': 2, 'P-209': 2, 'P-210': 3, 'P-211': 4, 'P-212': 5
        },
        'P_floor_2_right_corridor': {
            'P_floor_2_lobby': 3, 'P-213': 2, 'P-214': 3, 'P-215': 4, 'P-216': 5
        },
        'P-201': {'P_floor_2_left_corridor': 2}, 'P-202': {'P_floor_2_left_corridor': 3},
        'P-203': {'P_floor_2_left_corridor': 4}, 'P-204': {'P_floor_2_left_corridor': 5},
        'P-205': {'P_floor_2_left_corridor': 6}, 'P-206': {'P_floor_2_left_corridor': 7},
        'P-207': {'P_floor_2_left_corridor': 8}, 'P-208': {'P_floor_2_left_corridor': 9},
        'P-209': {'P_floor_2_center': 2}, 'P-210': {'P_floor_2_center': 3},
        'P-211': {'P_floor_2_center': 4}, 'P-212': {'P_floor_2_center': 5},
        'P-213': {'P_floor_2_right_corridor': 2}, 'P-214': {'P_floor_2_right_corridor': 3},
        'P-215': {'P_floor_2_right_corridor': 4}, 'P-216': {'P_floor_2_right_corridor': 5},
        
        # THIRD FLOOR (3)
        'P_floor_3_lobby': {
            'P_floor_3_left_corridor': 3, 'P_floor_3_right_corridor': 3, 'P_floor_3_center': 2,
            'P_lift_1': 2, 'P_stairs_1': 1, 'P_stairs_2': 1
        },
        'P_floor_3_left_corridor': {
            'P_floor_3_lobby': 3, 'P-301': 2, 'P-302': 3, 'P-303': 4, 'P-304': 5, 'P-305': 6
        },
        'P_floor_3_center': {
            'P_floor_3_lobby': 2, 'P-306': 2, 'P-307': 3, 'P-308': 4
        },
        'P_floor_3_right_corridor': {
            'P_floor_3_lobby': 3, 'P-309': 2, 'P-310': 3, 'P-311': 4, 'P-312': 5
        },
        'P-301': {'P_floor_3_left_corridor': 2}, 'P-302': {'P_floor_3_left_corridor': 3},
        'P-303': {'P_floor_3_left_corridor': 4}, 'P-304': {'P_floor_3_left_corridor': 5},
        'P-305': {'P_floor_3_left_corridor': 6},
        'P-306': {'P_floor_3_center': 2}, 'P-307': {'P_floor_3_center': 3}, 'P-308': {'P_floor_3_center': 4},
        'P-309': {'P_floor_3_right_corridor': 2}, 'P-310': {'P_floor_3_right_corridor': 3},
        'P-311': {'P_floor_3_right_corridor': 4}, 'P-312': {'P_floor_3_right_corridor': 5},
    },
    # Inter-block connections (outdoor paths)
    'inter_blocks': {
        'A_entrance': {'B_entrance': 50, 'N_entrance': 80, 'P_entrance': 100},
        'B_entrance': {'A_entrance': 50, 'N_entrance': 60, 'P_entrance': 70},
        'N_entrance': {'A_entrance': 80, 'B_entrance': 60, 'P_entrance': 40},
        'P_entrance': {'A_entrance': 100, 'B_entrance': 70, 'N_entrance': 40},
    }
}

def dijkstra(graph, start, end, preference='lift'):
    """
    Dijkstra's algorithm to find shortest path
    preference: 'lift' or 'stairs' - affects which paths are preferred
    """
    # Create a unified graph with proper node naming
    unified_graph = {}
    
    # Add all block graphs with proper node keys
    for block, nodes in graph.items():
        if block != 'inter_blocks':
            for node, edges in nodes.items():
                # Normalize node key
                if node == 'entrance':
                    node_key = f'{block}_entrance'
                elif not node.startswith(block):
                    node_key = f'{block}_{node}'
                else:
                    node_key = node
                
                if node_key not in unified_graph:
                    unified_graph[node_key] = {}
                
                # Add edges with normalized neighbor keys
                for neighbor, weight in edges.items():
                    if neighbor == 'entrance':
                        neighbor_key = f'{block}_entrance'
                    elif not neighbor.startswith(block):
                        neighbor_key = f'{block}_{neighbor}'
                    else:
                        neighbor_key = neighbor
                    unified_graph[node_key][neighbor_key] = weight
    
    # Add inter-block connections
    for node, edges in graph.get('inter_blocks', {}).items():
        if node not in unified_graph:
            unified_graph[node] = {}
        for neighbor, weight in edges.items():
            unified_graph[node][neighbor] = weight
    
    # Adjust weights based on preference - heavily penalize non-preferred routes
    adjusted_graph = {}
    for node, edges in unified_graph.items():
        adjusted_graph[node] = {}
        for neighbor, weight in edges.items():
            # If preference is stairs and this is a lift connection, heavily penalize
            if preference == 'stairs' and 'lift' in neighbor.lower():
                adjusted_graph[node][neighbor] = weight * 100  # Very large penalty
            # If preference is lift and this is a stairs connection, heavily penalize
            elif preference == 'lift' and 'stairs' in neighbor.lower():
                adjusted_graph[node][neighbor] = weight * 100  # Very large penalty
            else:
                adjusted_graph[node][neighbor] = weight
    
    # Normalize start node
    if start not in adjusted_graph:
        # Try to find matching entrance (e.g., B_entrance or entrance)
        for node in adjusted_graph:
            if node == start:
                start = node
                break
            elif start.endswith('_entrance') and node.endswith('_entrance'):
                # Match block entrances (B_entrance matches B_entrance)
                if start.split('_')[0] == node.split('_')[0]:
                    start = node
                    break
            elif start == 'entrance' and node.endswith('_entrance'):
                # If just 'entrance', prefer the block-specific one
                start = node
                break
    
    # Find end node (classroom) - try exact match first, then case-insensitive, then partial
    end_node = None
    # Try exact match
    if end in adjusted_graph:
        end_node = end
    else:
        # Try case-insensitive match
        end_upper = end.upper()
        for node in adjusted_graph:
            if node.upper() == end_upper:
                end_node = node
                break
        
        # If still not found, try partial match (for rooms like B-LA-204)
        if not end_node:
            for node in adjusted_graph:
                # Match if the end string is contained in node (case-insensitive)
                if end_upper in node.upper() or node.upper() in end_upper:
                    # Prefer exact room matches over corridor/lobby matches
                    if '-' in node and '-' in end:
                        end_node = node
                        break
                    elif not end_node:  # Keep first match as fallback
                        end_node = node
    
    if not end_node or start not in adjusted_graph:
        return None, float('inf')
    
    # Dijkstra's algorithm
    distances = {node: float('inf') for node in adjusted_graph}
    distances[start] = 0
    previous = {node: None for node in adjusted_graph}
    pq = [(0, start)]
    visited = set()
    
    while pq:
        current_dist, current = heapq.heappop(pq)
        
        if current in visited:
            continue
        
        visited.add(current)
        
        # Check if we reached the destination
        if current == end_node:
            break
        
        # Explore neighbors
        for neighbor, weight in adjusted_graph.get(current, {}).items():
            if neighbor in visited:
                continue
            
            new_dist = current_dist + weight
            if new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
                previous[neighbor] = current
                heapq.heappush(pq, (new_dist, neighbor))
    
    # Reconstruct path
    if end_node not in previous or distances[end_node] == float('inf'):
        return None, float('inf')
    
    path = []
    current = end_node
    
    while current is not None:
        path.insert(0, current)
        current = previous.get(current)
        if current == start:
            path.insert(0, start)
            break
    
    return path if path and path[0] == start else None, distances.get(end_node, float('inf'))

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Please login first'}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    enrollment_no = data.get('enrollment_no', '').strip().upper()
    name = data.get('name', '').strip()
    password = data.get('password', '').strip()
    
    if not enrollment_no or not name or not password:
        return jsonify({'error': 'All fields are required'}), 400
    
    # Check if user exists
    if enrollment_no in users_db:
        user = users_db[enrollment_no]
        if user['name'].lower() == name.lower() and user['password'] == password:
            session['user_id'] = enrollment_no
            session['user_name'] = user['name']
            session['user_type'] = user['type']
            
            # Track login history
            from datetime import datetime
            login_history.append({
                'enrollment_no': enrollment_no,
                'name': user['name'],
                'user_type': user['type'],
                'login_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
            
            return jsonify({
                'success': True,
                'message': f'Welcome {user["name"]}!',
                'user_type': user['type']
            })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    enrollment_no = data.get('enrollment_no', '').strip().upper()
    name = data.get('name', '').strip()
    password = data.get('password', '').strip()
    user_type = data.get('user_type', 'student')  # 'student' or 'employee'
    
    if not enrollment_no or not name or not password:
        return jsonify({'error': 'All fields are required'}), 400
    
    # Validate enrollment number format
    if len(enrollment_no) < 4:
        return jsonify({'error': 'Invalid enrollment number format'}), 400
    
    # Validate password (must be exactly 4 digits, any 4 digits allowed)
    if len(password) != 4 or not password.isdigit():
        return jsonify({'error': 'Password must be exactly 4 digits'}), 400
    
    # Check if user already exists
    if enrollment_no in users_db:
        return jsonify({'error': 'User with this enrollment number already exists. Please login instead.'}), 400
    
    # Create new user
    users_db[enrollment_no] = {
        'name': name,
        'password': password,
        'type': user_type
    }
    
    # Auto-login after signup
    session['user_id'] = enrollment_no
    session['user_name'] = name
    session['user_type'] = user_type
    
    # Track login history
    from datetime import datetime
    login_history.append({
        'enrollment_no': enrollment_no,
        'name': name,
        'user_type': user_type,
        'login_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    })
    
    return jsonify({
        'success': True,
        'message': f'Account created successfully! Welcome {name}!',
        'user_type': user_type
    })

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/get-path', methods=['POST'])
@login_required
def get_path():
    data = request.json
    block = data.get('block', '').upper()
    classroom = data.get('classroom', '').strip().upper()
    preference = data.get('preference', 'lift')  # 'lift' or 'stairs'
    
    if not block or not classroom:
        return jsonify({'error': 'Block and classroom are required'}), 400
    
    if block not in ['A', 'B', 'N', 'P']:
        return jsonify({'error': 'Invalid block. Choose A, B, N, or P'}), 400
    
    # Validate classroom format - supports both formats:
    # Old: B-202 (Block-Floor-Room)
    # New: B-LA-204, B-CA-219, B-TR-217, etc. (Block-Type-Room)
    import re
    
    # Try new format first (B-LA-204, B-CA-219, etc.)
    classroom_pattern_new = re.match(r'^([ABNP])-([A-Z]+)-(\d+)$', classroom)
    # Try old format (B-202, A-301, etc.)
    classroom_pattern_old = re.match(r'^([ABNP])-(\d)(\d{2})$', classroom)
    
    if classroom_pattern_new:
        classroom_block = classroom_pattern_new.group(1)
        room_type = classroom_pattern_new.group(2)
        room_num = classroom_pattern_new.group(3)
        # Extract floor from room number (first digit)
        if len(room_num) >= 3:
            floor_number = int(room_num[0])
        else:
            floor_number = int(room_num[0]) if room_num else 0
    elif classroom_pattern_old:
        classroom_block = classroom_pattern_old.group(1)
        floor_number = int(classroom_pattern_old.group(2))
        room_number = classroom_pattern_old.group(3)
    else:
        return jsonify({'error': 'Invalid classroom format. Use format like B-LA-204, B-CA-219, B-202, etc.'}), 400
    
    # Validate block matches
    if classroom_block != block:
        return jsonify({'error': f'Block mismatch. You selected {block} Block but entered classroom {classroom}.'}), 400
    
    # Validate floor number (0 = ground, 1-3 = floors 1-3)
    if floor_number < 0 or floor_number > 3:
        floor_names = {0: 'Ground', 1: '1st', 2: '2nd', 3: '3rd'}
        return jsonify({
            'error': f'Invalid floor number. Floors available are: Ground (0), 1st (1), 2nd (2), and 3rd (3). You entered floor {floor_number}.'
        }), 400
    
    # Determine start (entrance of selected block)
    start = f'{block}_entrance'
    
    # Determine end (classroom)
    end = classroom
    
    # Get path using Dijkstra's algorithm
    path, distance = dijkstra(building_graph, start, end, preference)
    
    if not path:
        return jsonify({'error': 'Path not found. Please check the classroom number.'}), 404
    
    return jsonify({
        'success': True,
        'path': path,
        'distance': round(distance, 2),
        'steps': len(path),
        'preference': preference
    })

@app.route('/submit-feedback', methods=['POST'])
@login_required
def submit_feedback():
    data = request.json
    feedback_text = data.get('feedback', '').strip()
    
    if not feedback_text:
        return jsonify({'error': 'Feedback cannot be empty'}), 400
    
    from datetime import datetime
    user_feedback.append({
        'enrollment_no': session.get('user_id'),
        'name': session.get('user_name'),
        'feedback': feedback_text,
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    })
    
    return jsonify({
        'success': True,
        'message': 'Thank you for your feedback!'
    })

@app.route('/admin/users', methods=['GET'])
@login_required
def get_all_users():
    # Check if user is admin
    if session.get('user_type') != 'admin':
        return jsonify({'error': 'Access denied. Admin privileges required.'}), 403
    
    # Get unique users from login history
    unique_users = {}
    for login in login_history:
        enrollment = login['enrollment_no']
        if enrollment not in unique_users:
            unique_users[enrollment] = {
                'enrollment_no': enrollment,
                'name': login['name'],
                'user_type': login['user_type'],
                'last_login': login['login_time'],
                'login_count': 0
            }
        unique_users[enrollment]['login_count'] += 1
        # Update last login if this is more recent
        if login['login_time'] > unique_users[enrollment]['last_login']:
            unique_users[enrollment]['last_login'] = login['login_time']
    
    return jsonify({
        'success': True,
        'users': list(unique_users.values()),
        'total_logins': len(login_history)
    })

@app.route('/admin/feedback', methods=['GET'])
@login_required
def get_all_feedback():
    # Check if user is admin
    if session.get('user_type') != 'admin':
        return jsonify({'error': 'Access denied. Admin privileges required.'}), 403
    
    return jsonify({
        'success': True,
        'feedback': user_feedback,
        'total_feedback': len(user_feedback)
    })

@app.route('/admin/feedback/delete', methods=['POST'])
@login_required
def delete_feedback():
    # Check if user is admin
    if session.get('user_type') != 'admin':
        return jsonify({'error': 'Access denied. Admin privileges required.'}), 403
    
    data = request.json
    feedback_index = data.get('index')
    
    if feedback_index is None or not isinstance(feedback_index, int):
        return jsonify({'error': 'Invalid feedback index'}), 400
    
    if feedback_index < 0 or feedback_index >= len(user_feedback):
        return jsonify({'error': 'Feedback not found'}), 404
    
    # Delete the feedback
    deleted_feedback = user_feedback.pop(feedback_index)
    
    return jsonify({
        'success': True,
        'message': 'Feedback deleted successfully',
        'deleted_feedback': deleted_feedback
    })

@app.route('/check-auth')
def check_auth():
    if 'user_id' in session:
        return jsonify({
            'authenticated': True,
            'user_name': session.get('user_name'),
            'user_type': session.get('user_type')
        })
    return jsonify({'authenticated': False})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

