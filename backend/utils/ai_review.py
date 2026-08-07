import joblib
import pandas as pd
from scoring import calculate_credit_score, get_score_label

MODEL_PATH = "models/loan_model.pkl"
FEATURE_COLUMNS_PATH = "models/feature_columns.pkl"

model = joblib.load(MODEL_PATH)
feature_columns = joblib.load(FEATURE_COLUMNS_PATH)


def prepare_input_data(application_data):
    df = pd.DataFrame([application_data])
    df.columns = [col.strip().lower() for col in df.columns]

    df["total_income"] = df["applicant_income"] + df["coapplicant_income"]
    df["loan_income_ratio"] = df["loan_amount"] / (df["total_income"] + 1)

    if "dependents" in df.columns:
        df["dependents"] = df["dependents"].replace("3+", "3")
        df["dependents"] = df["dependents"].astype(int)

    if "credit_history" in df.columns:
        df["credit_history"] = df["credit_history"].astype(int)

    if "loan_id" in df.columns:
        df = df.drop(columns=["loan_id"])

    df = pd.get_dummies(df, drop_first=True)

    for col in feature_columns:
        if col not in df.columns:
            df[col] = 0

    df = df[feature_columns]
    return df


def generate_ai_review(application_data):
    prepared_df = prepare_input_data(application_data)

    prediction = model.predict(prepared_df)[0]
    probabilities = model.predict_proba(prepared_df)[0]

    rejection_probability = float(probabilities[0])
    approval_probability = float(probabilities[1])

    if prediction == 1:
        model_prediction = "Approved"
        confidence = round(approval_probability * 100, 2)
    else:
        model_prediction = "Rejected"
        confidence = round(rejection_probability * 100, 2)

    score = calculate_credit_score(
        gender=application_data["gender"],
        married=application_data["married"],
        dependents=application_data["dependents"],
        education=application_data["education"],
        self_employed=application_data["self_employed"],
        applicant_income=application_data["applicant_income"],
        coapplicant_income=application_data["coapplicant_income"],
        loan_amount=application_data["loan_amount"],
        loan_amount_term=application_data["loan_amount_term"],
        credit_history=application_data["credit_history"],
        property_area=application_data["property_area"]
    )

    score_label = get_score_label(score)

    if score >= 80:
        final_prediction = "Approved"
        recommendation = "Approved by rule-based credit score guardrail. Strong profile."
        final_confidence = max(confidence, 85.0)

    elif score >= 70:
        if model_prediction == "Rejected":
            final_prediction = "Manual Review"
            recommendation = "Rule-based score is strong, but AI model is cautious. Officer review recommended."
            final_confidence = confidence
        else:
            final_prediction = "Approved"
            recommendation = "Approved. Both score and AI review are supportive."
            final_confidence = confidence

    else:
        if model_prediction == "Approved":
            final_prediction = "Approved"
            recommendation = "AI model supports approval, but verify documents carefully."
            final_confidence = confidence
        else:
            final_prediction = "Rejected"
            recommendation = "Higher risk based on AI review and lower score band."
            final_confidence = confidence

    return {
        "prediction": final_prediction,
        "confidence": round(final_confidence, 2),
        "approval_probability": round(approval_probability * 100, 2),
        "rejection_probability": round(rejection_probability * 100, 2),
        "recommendation": recommendation,
        "model_prediction": model_prediction,
        "credit_score": score,
        "score_label": score_label
    }