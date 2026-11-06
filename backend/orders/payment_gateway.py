from .daraja import trigger_stk_push

def generate_checkout_link(order, payment, customer_name, customer_email, phone_number):
    """
    The Master Router. Looks at the selected payment method and sends it to the right file.
    """
    print(f"--- ROUTING PAYMENT FOR ORDER {order.id} ---")
    
    if payment.payment_method == 'M-Pesa':
        
        # 1. Fire the request to Safaricom
        daraja_response = trigger_stk_push(
            phone_number=phone_number, 
            amount=payment.amount, 
            reference=payment.transaction_reference
        )
        
        # 2. Check if Safaricom accepted it
        if daraja_response['status'] == 'success':
            # The phone is buzzing! Send the user to the profile page to wait for confirmation.
            return {
                "status": "success",
                "checkout_url": f"http://localhost:5173/profile?payment_pending=true"
            }
        else:
            return {
                "status": "error",
                "message": daraja_response['message']
            }
            
    # We will build Card and Crypto routing here later
    return {
        "status": "error",
        "message": f"Payment method '{payment.payment_method}' is not set up yet."
    }