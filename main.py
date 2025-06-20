from fastapi import FastAPI, Request, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scheduler import schedule_reminder, cancel_reminder as scheduler_cancel_reminder
from database import save_reminder_to_db, init_db, get_all_reminders as db_get_all_reminders, delete_reminder_by_id, update_reminder_status
from vapi_trigger import test_vapi_connection, call_user, list_phone_numbers
import uvicorn
import re
import json
from typing import List

# --- WebSocket Connection Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# --- App Setup ---
app = FastAPI(title="MedBuddy API", description="Medication reminder voice assistant backend")

# Enable CORS for all origins (for dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pass the manager to the scheduler
from scheduler import scheduler
scheduler.app_manager = manager

class Reminder(BaseModel):
    medication: str
    time: str

# --- Add this for VAPI say_reminder tool ---
class ReminderSpeech(BaseModel):
    message: str

# @app.post("/api/say_reminder")
# def say_reminder(body: ReminderSpeech):
#     # VAPI will speak the message using the tool's message template
#     return {"status": "ok"}
# --- End addition ---

@app.on_event("startup")
def startup():
    """Initialize the database on startup"""
    init_db()

@app.post("/api/save_reminder")
async def save_reminder(reminder: Reminder, background_tasks: BackgroundTasks):
    """
    Save a medication reminder and schedule it for the specified time
    """
    reminder_id = save_reminder_to_db(reminder.medication, reminder.time)
    background_tasks.add_task(schedule_reminder, reminder_id, reminder.medication, reminder.time)
    
    # Broadcast update
    reminders = db_get_all_reminders()
    await manager.broadcast(json.dumps({"event": "reminders_updated", "data": reminders}))
    
    return {"status": "scheduled", "id": reminder_id}

@app.post("/api/save_reminder_debug")
async def save_reminder_debug(request: Request):
    """
    Debug endpoint to see what VAPI is sending to the save_reminder webhook
    """
    try:
        body = await request.json()
        print(f"🔍 VAPI webhook received: {body}")
        return {"status": "debug_received", "data": body}
    except Exception as e:
        print(f"❌ Error in debug webhook: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/api/chat")
async def chat(request: Request, background_tasks: BackgroundTasks):
    data = await request.json()
    user_message = data.get("message", "")
    # Simple pattern: Remind me to take [medication] at [time]
    match = re.match(r"remind me to take (.+) at (.+)", user_message, re.I)
    if match:
        medication, time = match.groups()
        reminder_id = save_reminder_to_db(medication, time)
        background_tasks.add_task(schedule_reminder, reminder_id, medication, time)
        return {"reply": f"✅ Reminder set for {medication} at {time}!"}
    else:
        return {"reply": "💬 MedBuddy: I can set reminders if you say 'Remind me to take [medication] at [time]'."}

@app.post("/api/say_reminder")
def say_reminder_endpoint(payload: dict):
    """
    Endpoint invoked by VAPI to play out the reminder message.
    Expects JSON: { "message": "..." }
    """
    message = payload.get("message")
    print(f"🔊 say_reminder received message: {message}")
    return {"status": "ok"}

@app.get("/reminders")
def get_all_reminders():
    """Get all saved medication reminders"""
    return db_get_all_reminders()

@app.delete("/reminders/{reminder_id}")
def delete_reminder(reminder_id: int):
    """Delete a specific reminder"""
    try:
        delete_reminder_by_id(reminder_id)
        return {"status": "deleted", "id": reminder_id}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.put("/reminders/{reminder_id}/status")
def update_reminder_status_endpoint(reminder_id: int, status: str):
    """Update the status of a reminder"""
    try:
        update_reminder_status(reminder_id, status)
        return {"status": "updated", "id": reminder_id, "new_status": status}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/reminders/{reminder_id}/cancel")
async def cancel_reminder(reminder_id: int):
    """Cancel a specific reminder"""
    try:
        scheduler_cancel_reminder(reminder_id)
        update_reminder_status(reminder_id, "cancelled")
        
        # Broadcast update
        reminders = db_get_all_reminders()
        await manager.broadcast(json.dumps({"event": "reminders_updated", "data": reminders}))
        
        return {"status": "cancelled", "id": reminder_id}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/test-vapi")
def test_vapi():
    """Test VAPI connection and credentials"""
    return test_vapi_connection()

@app.get("/phone-numbers")
def get_phone_numbers():
    """List all available phone numbers from VAPI account"""
    return list_phone_numbers()

@app.post("/api/trigger_call")
async def trigger_call(request: Request):
    data = await request.json()
    message = data.get("message", "It's time to take your medication!")
    
    # Check if this is a scheduled reminder call (contains medication info)
    if "medication" in data:
        # This is a scheduled reminder call
        medication = data.get("medication", "medication")
        call_user(medication)
    else:
        # This is a setup call or test call
        call_user("general")
    
    return {"status": "calling"}

@app.post("/api/cancel_reminder")
async def cancel_reminder_webhook(request: Request):
    """Webhook endpoint for VAPI to cancel reminders by voice"""
    try:
        data = await request.json()
        medication = data.get("medication", "")
        
        if not medication:
            return {"status": "error", "message": "Medication name required"}
        
        reminders = db_get_all_reminders()
        matching_reminders = [r for r in reminders if r['status'] == 'scheduled' and medication.lower() in r['medication'].lower()]
        
        if not matching_reminders:
            return {"status": "error", "message": f"No active reminder found for {medication}"}
        
        reminder_id = matching_reminders[0]['id']
        scheduler_cancel_reminder(reminder_id)
        update_reminder_status(reminder_id, "cancelled")
        
        # Broadcast update
        updated_reminders = db_get_all_reminders()
        await manager.broadcast(json.dumps({"event": "reminders_updated", "data": updated_reminders}))
        
        return { "status": "cancelled", "id": reminder_id, "medication": matching_reminders[0]['medication'] }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection open
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
def root():
    """Root endpoint with API information"""
    return {
        "message": "MedBuddy API is running",
        "endpoints": {
            "save_reminder": "POST /api/save_reminder",
            "chat": "POST /api/chat",
            "get_reminders": "GET /reminders",
            "test_vapi": "GET /test-vapi"
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 