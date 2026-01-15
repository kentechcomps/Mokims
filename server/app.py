from flask import Flask, request, jsonify
import requests
from .config import PAYSTACK_SECRET_KEY, PAYSTACK_BASE_URL
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allow frontend requests

HEADERS = {
    "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
    "Content-Type": "application/json"
}

# Temporary in-memory order store
orders = {}

@app.route("/paystack/pay", methods=["POST"])
def paystack_pay():
    data = request.json
    phone = data.get("phone")
    amount = data.get("amount")
    reference = data.get("reference")
    email = data.get("email")

    # 1️⃣ Validate required fields
    if not all([phone, amount, reference, email]):
        return jsonify({"message": "Missing required fields"}), 400

    # 2️⃣ Sanitize and validate phone number
    phone_clean = ''.join(filter(str.isdigit, phone))  # remove +, spaces, etc.
    if not (phone_clean.startswith("2547") and len(phone_clean) == 12):
        return jsonify({"message": "Invalid Safaricom phone number format. Use 07XXXXXXXX or 2547XXXXXXXX"}), 400

    # 3️⃣ Add Paystack fee (1.5%) and convert to kobo
    fee = round(amount * 0.015)
    total_amount_kobo = int((amount + fee) * 100)

    # 4️⃣ Prepare payload
    payload = {
        "email": email,
        "amount": str(total_amount_kobo),  # As string
        "reference": reference,
        "currency": "KES",  # Optional but good for KES
        "mobile_money": {
            "phone": f"+{phone_clean}" ,  # Changed from "phone"
            "provider": "mpesa"    # Hyphen added
        }
    }

    print("Payload sent to Paystack:", payload)

    # 5️⃣ Send request to Paystack
    try:
        resp = requests.post(f"{PAYSTACK_BASE_URL}/charge", json=payload, headers=HEADERS)
        print(f"Paystack response status: {resp.status_code}")
        print(f"Paystack response headers: {resp.headers}")
        print(f"Paystack raw response: {resp.text}")  # This will show exact error body!

        resp_data = resp.json()
        print(f"Paystack JSON response: {resp_data}")  # Log full dict
        if resp.status_code not in (200, 201):
            return jsonify({
                "message": "Paystack returned an error",
                "status_code": resp.status_code,
                "response": resp_data  # This gets sent to frontend too
            }), resp.status_code
    except requests.exceptions.RequestException as e:
        print(f"Request exception: {e}")  # More detail
        return jsonify({"message": "Error contacting Paystack", "error": str(e)}), 500
    except ValueError as e:  # JSON decode fail
        print(f"JSON decode error: {e}, raw text: {resp.text}")
        return jsonify({"message": "Invalid response from Paystack", "raw": resp.text}), 500

    # 6️⃣ Save order as pending
    orders[reference] = {"status": "pending", "amount": amount}

    return jsonify({
        "message": "STK push sent",
        "reference": reference,
        "total_amount": total_amount_kobo
    }), 200


# ---------------------------
# Check order status
# ---------------------------
@app.route("/orders/<reference>", methods=["GET"])
def order_status(reference):
    order = orders.get(reference)
    if not order:
        return jsonify({"status": "pending"}), 200
    return jsonify({"status": order["status"], "amount": order["amount"]}), 200

# ---------------------------
# Run server
# ---------------------------
if __name__ == "__main__":
    if not PAYSTACK_SECRET_KEY:
        raise RuntimeError("PAYSTACK_SECRET_KEY not set")
    if not PAYSTACK_BASE_URL:
        raise RuntimeError("PAYSTACK_BASE_URL not set")
    app.run(debug=True)
