from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

# Load all models and encoders
model1 = joblib.load("models/model1_stress_mood.pkl")
le_stress = joblib.load("models/le_stress.pkl")
le_mood = joblib.load("models/le_mood.pkl")

model2 = joblib.load("models/model2_depression.pkl")
le_depression = joblib.load("models/le_depression.pkl")

model3 = joblib.load("models/model3_anxiety.pkl")
scaler_anxiety = joblib.load("models/scaler_anxiety.pkl")

expected_columns = [
    "heartRate", "restingHeartRate", "steps", "exerciseMinutes",
    "totalCaloriesBurned", "sleepDuration", "rem", "light", "deep"
]


@app.route("/predict/stress-mood", methods=["POST"])
def predict_stress_mood():
    try:
        data = request.get_json()

        # Check if all required fields are present
        missing_fields = [col for col in expected_columns if col not in data]
        if missing_fields:
            return jsonify({"error": f"Missing fields: {missing_fields}"}), 400

        # Create DataFrame in expected order
        input_df = pd.DataFrame([[data[col] for col in expected_columns]], columns=expected_columns)

        # Predict
        prediction = model1.predict(input_df)
        stress_pred = le_stress.inverse_transform([prediction[0][0]])[0]
        mood_pred = le_mood.inverse_transform([prediction[0][1]])[0]

        return jsonify({
            "stress": stress_pred,
            "mood": mood_pred
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/predict/depression", methods=["POST"])
def predict_depression():
    try:
        data = request.get_json()

        # Required features
        expected_cols = [
            "heartRate", "restingHeartRate", "steps", "exerciseMinutes",
            "totalCaloriesBurned", "sleepDuration", "rem", "light", "deep",
            "weight", "bodyFat"
        ]

        # Validate input
        missing = [col for col in expected_cols if col not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {missing}"}), 400

        # Form input DataFrame
        input_df = pd.DataFrame([[data[col] for col in expected_cols]], columns=expected_cols)

        # Predict
        pred = model2.predict(input_df)[0]  # e.g., [1]
        label = le_depression.inverse_transform([pred])[0]

        return jsonify({
            "depressionRisk": str(label)  
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route("/predict/anxiety", methods=["POST"])
def predict_anxiety():
    try:
        data = request.get_json()

        # These 9 features were used for training
        expected_cols = [
            "heartRate", "restingHeartRate", "steps",
            "exerciseMinutes", "totalCaloriesBurned",
            "sleepDuration", "rem", "light", "deep"
        ]

        # Check for missing fields
        missing = [col for col in expected_cols if col not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {missing}"}), 400

        # Create DataFrame for prediction
        input_df = pd.DataFrame([[data[col] for col in expected_cols]], columns=expected_cols)

        # Scale and predict
        X_scaled = scaler_anxiety.transform(input_df)
        prediction = model3.predict(X_scaled)[0]

        return jsonify({
            "anxietyRisk": int(prediction)  # Ensure it's JSON serializable
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    app.run(debug=True)
