from flask import Flask, render_template, request, jsonify, redirect, url_for
from functions import predict_password


app = Flask(__name__)

# Main route - serves the HTML page
@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")

# API endpoint for password strength prediction
@app.route("/check-strength", methods=["POST"])
def check_strength():
    """
    API endpoint to check password strength
    Accepts JSON with 'password' field
    Returns JSON with prediction class, confidence, and probabilities
    """
    try:
        # Get password from JSON request body
        data = request.get_json()
        password = data.get('password', '')
        
        if not password:
            return jsonify({
                'success': False,
                'error': 'Password is required'
            }), 400
        
        # Call predict_password function from functions.py
        # Returns: pred_class (0=Weak, 1=Medium, 2=Strong), confidence, probs
        pred_class, confidence, probs, reason, feedback = predict_password(password)
        
        # Map prediction class to readable labels
        strength_labels = {
            0: 'Weak',
            1: 'Medium', 
            2: 'Strong'
        }
        
        # Return prediction results as JSON
        return jsonify({
            'success': True,
            'prediction_class': int(pred_class),
            'strength': strength_labels.get(pred_class, 'Unknown'),
            'confidence': float(confidence),
            'probabilities': {
                'weak': float(probs[0]),
                'medium': float(probs[1]),
                'strong': float(probs[2])
            }
        }), 200
        
    except Exception as e:
        print("Error during password strength check:", e)
        return jsonify({
            'success': False,
            'error': 'An error occurred during password strength check'
        }), 500


# Legacy route for backwards compatibility (if needed)
@app.route('/strength', methods=['POST'])
def strength():
    print("Legacy strength endpoint triggered!")
    return redirect(url_for('home'))


if __name__=='__main__':
    print("\nStarting server on http://127.0.0.1:5000")
    print("\nPress CTRL+C to stop the server")
    app.run(debug=True, host='127.0.0.1', port=5000)