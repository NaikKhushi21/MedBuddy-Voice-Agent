import requests
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Get environment variables
VAPI_API_KEY = os.getenv("VAPI_API_KEY")
ASSISTANT_ID = os.getenv("ASSISTANT_ID")
USER_PHONE_NUMBER = os.getenv("USER_PHONE_NUMBER")
PHONE_NUMBER_ID = os.getenv("PHONE_NUMBER_ID")  # Get this from Vapi Dashboard > Phone Numbers

def list_phone_numbers():
    """
    List all available phone numbers from VAPI account
    """
    if not VAPI_API_KEY:
        return {"status": "error", "message": "VAPI_API_KEY not set"}
    
    headers = {
        "Authorization": f"Bearer {VAPI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(
            "https://api.vapi.ai/phone-number",
            headers=headers,
            timeout=10
        )
        logger.debug(f"[VAPI] Phone numbers status: {response.status_code}")
        logger.debug(f"[VAPI] Phone numbers response: {response.text}")
        
        if response.status_code == 200:
            phone_numbers = response.json()
            return {
                "status": "success", 
                "phone_numbers": phone_numbers,
                "message": f"Found {len(phone_numbers)} phone number(s)"
            }
        else:
            return {"status": "error", "message": f"Failed to get phone numbers: {response.status_code} {response.text}"}
    except Exception as e:
        logger.error(f"Phone numbers error: {str(e)}")
        return {"status": "error", "message": f"Phone numbers error: {str(e)}"}

def call_user(medication):
    """
    Makes an outbound call via VAPI to remind the user to take medication.
    Passes medication info via metadata so the assistant knows what to remind about.
    """
    headers = {
        "Authorization": f"Bearer {VAPI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Pass medication info via metadata so the assistant knows what to remind about
    # call_payload = {
    #     "assistantId": ASSISTANT_ID,
    #     "phoneNumberId": PHONE_NUMBER_ID,
    #     "customer": { "number": USER_PHONE_NUMBER },
    #     "metadata": {
    #         "medication": medication,
    #         "call_type": "scheduled_reminder"
    #     }
    # }

    call_payload = {
        "assistantId": ASSISTANT_ID,
        "phoneNumberId": PHONE_NUMBER_ID,
        "customer": { "number": USER_PHONE_NUMBER },
        "assistantOverrides": {
            "variableValues": {
                "message": f"It's time to take your {medication}."
            }
        }
    }
    
    print("🔐 Sending call with headers:", headers)
    print("📦 Call payload:", call_payload)
    print(f"💊 Reminder call for: {medication}")
    
    call_resp = requests.post(
        "https://api.vapi.ai/call",
        headers=headers,
        json=call_payload
    )
    print(f"Call response: {call_resp.status_code} {call_resp.text}")

    if call_resp.status_code in (200, 201):
        print("✅ Reminder call initiated successfully!")
        print(f"📞 The call will remind you to take: {medication}")
    else:
        print("❌ Call was not created successfully.")

def test_vapi_connection():
    if not VAPI_API_KEY:
        return {"status": "error", "message": "VAPI_API_KEY not set"}
    headers = {
        "Authorization": f"Bearer {VAPI_API_KEY}",
        "Content-Type": "application/json"
    }
    try:
        response = requests.get(
            "https://api.vapi.ai/assistant", 
            headers=headers,
            timeout=10
        )
        logger.debug(f"[VAPI] Test connection status: {response.status_code}")
        logger.debug(f"[VAPI] Test connection response: {response.text}")
        if response.status_code == 200:
            return {"status": "success", "message": "VAPI connection successful"}
        else:
            return {"status": "error", "message": f"VAPI connection failed: {response.status_code} {response.text}"}
    except Exception as e:
        logger.error(f"VAPI connection error: {str(e)}")
        return {"status": "error", "message": f"VAPI connection error: {str(e)}"} 