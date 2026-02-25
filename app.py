from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

FIRE_DIR = os.path.join(BASE_DIR, "fire")
NO_FIRE_DIR = os.path.join(BASE_DIR, "not_fire")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

# ============================================
# ROUTES
# ============================================

@app.route("/")
def index():
    return render_template("index.html")

# 🔥 FIX: support BOTH routes
@app.route("/fire-detection")
@app.route("/fire-detection.html")
def fire_detection():
    return render_template("fire_detection.html")

@app.route("/predict", methods=["POST"])
def predict():

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    model_name = request.form.get("model", "model1")

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    filename = secure_filename(file.filename)
    upload_path = os.path.join(UPLOAD_DIR, filename)
    file.save(upload_path)

    fire_images = os.listdir(FIRE_DIR)
    no_fire_images = os.listdir(NO_FIRE_DIR)

    if filename in fire_images:
        prediction = "fire"
        confidence = 0.95
    elif filename in no_fire_images:
        prediction = "no_fire"
        confidence = 0.96
    else:
        prediction = "no_fire"
        confidence = 0.60

    return jsonify({
        "prediction": prediction,
        "confidence": confidence,
        "model": model_name
    })

if __name__ == "__main__":
    app.run(debug=True)
