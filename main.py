from flask import Flask, render_template, request, jsonify, redirect, url_for
from functions import predict_password


app = Flask(__name__)

@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")

@app.route("/check-strength", methods=["POST"])
def check_strength():
    try:
        data = request.get_json()
        password = data.get('password', '')
        
        if not password:
            return jsonify({
                'success': False,
                'error': 'Password is required'
            }), 400

        pred_class, confidence, probs, reason, feedback = predict_password(password)
        
        strength_labels = {
            0: 'Very Weak',
            1: 'Weak',
            2: 'Medium',
            3: 'Strong',
            4: 'Very Strong'
        }
        
        return jsonify({
            'success': True,
            'prediction_class': int(pred_class),
            'strength': strength_labels.get(pred_class, 'Unknown'),
            'confidence': float(confidence),
            'feedback': feedback,
            'reason': reason,
            'probabilities': {
                'very_weak': float(probs[0]),
                'weak': float(probs[1]),
                'medium': float(probs[2]),
                'strong': float(probs[3]),
                'very_strong': float(probs[4])
            }
        }), 200
        
    except Exception as e:
        print("Error during password strength check:", e)
        return jsonify({
            'success': False,
            'error': 'An error occurred during password strength check'
        }), 500


@app.route('/strength', methods=['POST'])
def strength():
    print("Legacy strength endpoint triggered!")
    return redirect(url_for('home'))


if __name__=='__main__':
    print("\nStarting server on http://127.0.0.1:5000")
    app.run(debug=True, host='127.0.0.1', port=5000)