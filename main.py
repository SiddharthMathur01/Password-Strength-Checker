from flask import Flask, render_template, request, jsonify, redirect, url_for
from functions import predict_password


app = Flask(__name__)
@app.route("/", methods=["GET", "POST"])
def home():
    result = None
    if request.method == "POST":
        mail = request.form.get("mail")
        if mail:
            try:
                prediction = predict_password(mail)[0]
                result = prediction
                print("Detection Result:", prediction)
            except Exception as e:
                print("Error during detection:", e)
                result = "Error"

    return render_template("index.html", result=result)

@app.route('/strength', methods=['POST'])
def strength():
    print("Function in Flask was triggered!")
    return redirect(url_for('index'))


if __name__=='__main__':
        print("\nStarting server on http://127.0.0.1:5000")
        print("\nPress CTRL+C to stop the server")
        app.run(debug=True, host='127.0.0.1', port=5000)
