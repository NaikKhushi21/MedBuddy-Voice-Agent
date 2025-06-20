from apscheduler.schedulers.background import BackgroundScheduler
from vapi_trigger import call_user
from database import get_reminder_by_id, update_reminder_status, get_all_reminders
from datetime import datetime
import dateutil.parser
import logging
import asyncio
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the background scheduler
scheduler = BackgroundScheduler()
scheduler.start()

def execute_reminder(reminder_id: int, medication: str):
    """
    Execute a medication reminder - make the call and mark as completed
    """
    try:
        # Make the call
        call_user(medication)
        
        # Mark the reminder as completed
        update_reminder_status(reminder_id, "completed")
        logger.info(f"Executed and marked reminder {reminder_id} for {medication} as completed")
        
        # Broadcast the update via WebSocket
        if hasattr(scheduler, 'app_manager'):
            reminders = get_all_reminders()
            # Run the async broadcast function in the event loop
            asyncio.run(scheduler.app_manager.broadcast(json.dumps({"event": "reminders_updated", "data": reminders})))
            
    except Exception as e:
        logger.error(f"Error executing reminder {reminder_id}: {e}")
        # Optionally mark as failed
        update_reminder_status(reminder_id, "failed")

def schedule_reminder(reminder_id: int, medication: str, time_str: str):
    """
    Schedule a medication reminder using APScheduler
    
    Args:
        reminder_id: Unique identifier for the reminder
        medication: Name of the medication
        time_str: Time string to parse (e.g., "8 PM", "2024-01-15T20:00:00")
    """
    try:
        # Parse the time string
        run_time = dateutil.parser.parse(time_str)
        
        # Add the job to the scheduler - use execute_reminder instead of call_user
        scheduler.add_job(
            execute_reminder,
            'date',
            run_date=run_time,
            args=[reminder_id, medication],
            id=str(reminder_id),
            name=f"Medication reminder for {medication}"
        )
        
        logger.info(f"Scheduled reminder for {medication} at {run_time}")
        
    except Exception as e:
        logger.error(f"Error scheduling reminder: {e}")
        raise

def cancel_reminder(reminder_id: int):
    """
    Cancel a scheduled reminder
    
    Args:
        reminder_id: ID of the reminder to cancel
    """
    try:
        scheduler.remove_job(str(reminder_id))
        logger.info(f"Cancelled reminder {reminder_id}")
    except Exception as e:
        logger.error(f"Error cancelling reminder {reminder_id}: {e}")

def get_scheduled_jobs():
    """
    Get all currently scheduled jobs
    """
    return scheduler.get_jobs() 