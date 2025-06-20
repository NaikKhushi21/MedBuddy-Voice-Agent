import sqlite3
from datetime import datetime
import logging

# Configure logging
logger = logging.getLogger(__name__)

DB_NAME = "reminders.db"

def init_db():
    """
    Initialize the SQLite database and create the reminders table if it doesn't exist
    """
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS reminders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                medication TEXT NOT NULL,
                time TEXT NOT NULL,
                created_at TEXT NOT NULL,
                status TEXT DEFAULT 'scheduled'
            )
        ''')
        
        conn.commit()
        conn.close()
        logger.info("Database initialized successfully")
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

def save_reminder_to_db(medication: str, time: str) -> int:
    """
    Save a medication reminder to the database
    
    Args:
        medication: Name of the medication
        time: Time for the reminder
        
    Returns:
        int: The ID of the created reminder
    """
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO reminders (medication, time, created_at) VALUES (?, ?, ?)",
            (medication, time, datetime.now().isoformat())
        )
        
        conn.commit()
        reminder_id = cursor.lastrowid
        conn.close()
        
        logger.info(f"Saved reminder {reminder_id} for {medication} at {time}")
        return reminder_id
        
    except Exception as e:
        logger.error(f"Error saving reminder to database: {e}")
        raise

def get_all_reminders():
    """
    Get all medication reminders from the database
    
    Returns:
        list: List of reminder dictionaries
    """
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, medication, time, created_at, status FROM reminders ORDER BY created_at DESC")
        rows = cursor.fetchall()
        conn.close()
        
        return [
            {
                "id": row[0], 
                "medication": row[1], 
                "time": row[2], 
                "created_at": row[3],
                "status": row[4]
            }
            for row in rows
        ]
        
    except Exception as e:
        logger.error(f"Error getting reminders from database: {e}")
        return []

def get_reminder_by_id(reminder_id: int):
    """
    Get a specific reminder by its ID
    
    Args:
        reminder_id: ID of the reminder to retrieve
        
    Returns:
        tuple: (medication, time) or None if not found
    """
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        
        cursor.execute("SELECT medication, time FROM reminders WHERE id = ?", (reminder_id,))
        row = cursor.fetchone()
        conn.close()
        
        return row
        
    except Exception as e:
        logger.error(f"Error getting reminder {reminder_id} from database: {e}")
        return None

def update_reminder_status(reminder_id: int, status: str):
    """
    Update the status of a reminder
    
    Args:
        reminder_id: ID of the reminder to update
        status: New status (e.g., 'completed', 'cancelled')
    """
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        
        cursor.execute("UPDATE reminders SET status = ? WHERE id = ?", (status, reminder_id))
        conn.commit()
        conn.close()
        
        logger.info(f"Updated reminder {reminder_id} status to {status}")
        
    except Exception as e:
        logger.error(f"Error updating reminder status: {e}")

def delete_reminder_by_id(reminder_id: int):
    """
    Delete a reminder from the database
    
    Args:
        reminder_id: ID of the reminder to delete
    """
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM reminders WHERE id = ?", (reminder_id,))
        conn.commit()
        conn.close()
        
        logger.info(f"Deleted reminder {reminder_id}")
        
    except Exception as e:
        logger.error(f"Error deleting reminder: {e}")
        raise 