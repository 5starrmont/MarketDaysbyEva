import requests
from requests.auth import HTTPBasicAuth
from django.conf import settings
from datetime import datetime
import base64

def get_access_token():
    """Trades the Consumer Key and Secret for a temporary Safaricom Access Token."""
    api_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    
    try:
        r = requests.get(
            api_url, 
            auth=HTTPBasicAuth(settings.DARAJA_CONSUMER_KEY, settings.DARAJA_CONSUMER_SECRET)
        )
        r.raise_for_status()
        return r.json()['access_token']
    except Exception as e:
        print("DARAJA TOKEN ERROR:", e)
        return None

def trigger_stk_push(phone_number, amount, reference):
    """Formats the payload and sends the STK Push request to the customer's phone."""
    access_token = get_access_token()
    if not access_token:
        return {"status": "error", "message": "Could not authenticate with Safaricom."}

    api_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    headers = {"Authorization": f"Bearer {access_token}"}

    # Safaricom requires a specific timestamp format
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    
    # The password is a base64 encoded string of Shortcode + Passkey + Timestamp
    password_str = f"{settings.DARAJA_SHORTCODE}{settings.DARAJA_PASSKEY}{timestamp}"
    password = base64.b64encode(password_str.encode()).decode('utf-8')

    # Clean the phone number to Safaricom's strict 2547XXXXXXXX format
    clean_phone = phone_number.replace('+', '').replace(' ', '')
    if clean_phone.startswith('0'):
        clean_phone = '254' + clean_phone[1:]

    payload = {
        "BusinessShortCode": settings.DARAJA_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(float(amount)), # Now grabs the actual total from the checkout
        "PartyA": clean_phone,
        "PartyB": settings.DARAJA_SHORTCODE,
        "PhoneNumber": clean_phone,
        "CallBackURL": "https://oversevere-micki-excursionary.ngrok-free.dev/api/orders/mpesa/callback/", 
        "AccountReference": reference,
        "TransactionDesc": "Market Days Order"
    }

    try:
        response = requests.post(api_url, json=payload, headers=headers)
        data = response.json()
        print("DARAJA STK RESPONSE:", data)
        
        # Safaricom uses "0" as their success code
        if data.get("ResponseCode") == "0":
            return {
                "status": "success",
                "message": "STK Push sent successfully. Please check your phone."
            }
        else:
            return {
                "status": "error",
                "message": data.get("errorMessage", "Safaricom rejected the request.")
            }
    except Exception as e:
        return {"status": "error", "message": str(e)}