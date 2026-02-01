import sqlite3
import os

# Create absolute path to database file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "backend", "ramadan_tracker.db")

print(f"Connecting to database at: {DB_PATH}")

try:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if column exists
    cursor.execute("PRAGMA table_info(family_members)")
    columns = [info[1] for info in cursor.fetchall()]
    
    if "role" in columns:
        print("Column 'role' already exists.")
    else:
        print("Column 'role' does not exist. Adding it...")
        # Add the column with default 'adult'
        cursor.execute("ALTER TABLE family_members ADD COLUMN role VARCHAR DEFAULT 'adult'")
        conn.commit()
        print("Successfully added 'role' column.")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
