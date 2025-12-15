from flask import Flask, render_template

import os

# Explicitly set template folder to be in the same directory as this script
template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'templates'))
# Also set static folder explicitly if needed, but defaults are usually relative to root_path which is set by name. 
# However, explicit is better if CWD is varying.
static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'static'))

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/services')
def services():
    return render_template('services.html')

@app.route('/destinations')
def destinations():
    return render_template('destinations.html')

@app.route('/tracking')
def tracking():
    return render_template('tracking.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

# --- Tracking Logic (Strict Production Mode) ---
def fetch_external_tracking(tracking_id):
    """
    Placeholder for Official Courier APIs (DHL/UPS/FedEx).
    In a full production environment with API keys, requests would go here.
    For Phase 1, we strictly rely on the internal manual database 
    for controlled, accurate data presentation.
    """
    return None

@app.route('/api/track/<tracking_id>')
def track_shipment(tracking_id):
    import json
    import os
    
    # STRICT REQUIREMENT: No fake data. 
    # Use Internal Shipment Database (Mock for Phase 1 Manual Entry)
    
    db_path = os.path.join(app.root_path, 'data', 'shipments.json')
    
    if not os.path.exists(db_path):
        return {"error": "System Error: Database Unavailable"}, 500

    try:
        with open(db_path, 'r') as f:
            db = json.load(f)
    except json.JSONDecodeError:
        return {"error": "System Error: Database Corrupt"}, 500

    # Case-insensitive Lookup
    # Real live data only.
    shipment_data = db.get(tracking_id.upper())
    
    if shipment_data:
        # Normalize Data Structure
        response = {
            "tracking_id": tracking_id.upper(),
            "courier": shipment_data.get("courier", "Unknown"),
            "status": shipment_data.get("status", "Unknown"),
            "current_location": shipment_data.get("current_location", "Unknown"),
            "last_update": shipment_data.get("history", [{}])[0].get("date", "N/A"),
            "history": shipment_data.get("history", [])
        }
        return response
    else:
        return {"error": "Tracking ID not found. Please verify your ID or contact support."}, 404

if __name__ == '__main__':
    app.run(debug=True)
