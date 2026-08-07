import token

from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from db import get_connection
from services import (
    get_user_by_token,
    authenticate_user,
    create_user,
    create_loan_application,
    get_user_applications,
    get_pending_loans,
    update_loan_status,
    generate_ai_review_for_loan,
)
from scoring import calculate_credit_score, get_score_label

app = Flask(__name__)
CORS(
    app,
    resources={r"/api/*": {"origins": "http://localhost:5173"}},
    supports_credentials=False,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        return "", 200

def extract_bearer_token():
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return None, jsonify({"error": "Authorization token required"}), 401

    auth_header = auth_header.strip()

    if not auth_header.startswith("Bearer "):
        return None, jsonify({"error": "Authorization header must be Bearer token"}), 401

    token = auth_header.split(" ", 1)[1].strip()

    if not token:
        return None, jsonify({"error": "Invalid bearer token"}), 401

    return token, None, None


@app.route("/")
def home():
    return "BankLite backend is running!"


@app.route("/test-db")
def test_db():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT current_database();")
        db_name = cur.fetchone()[0]
        cur.close()
        conn.close()

        return jsonify({
            "message": "Database connected successfully",
            "database_name": db_name
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/v1/auth/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON body is required"}), 400

    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if not full_name or not email or not password or not role:
        return jsonify({
            "error": "full_name, email, password, and role are required"
        }), 400

    if role not in ["customer", "credit_officer"]:
        return jsonify({
            "error": "Role must be either 'customer' or 'credit_officer'"
        }), 400

    try:
        result = create_user(full_name, email, password, role)
        status = result.pop("status")
        return jsonify(result), status

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/v1/auth/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON body is required"}), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        result = authenticate_user(email, password)
        status = result.pop("status")
        return jsonify(result), status

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/v1/loans/apply", methods=["POST", "OPTIONS"])
@cross_origin(origins="http://localhost:5173", allow_headers=["Content-Type", "Authorization"])
def apply_loan():
    try:
        token, error_response, status_code = extract_bearer_token()
        if error_response:
            return error_response, status_code

        user = get_user_by_token(token)
        if not user:
            return jsonify({"error": "Invalid or expired token"}), 401

        user_id = user["id"]
        email = user["email"]
        full_name = user["full_name"]
        role = user["role"]

        if role != "customer":
            return jsonify({"error": "Access denied. Customers only.", "current_role": role}), 403

        data = request.get_json()

        required_fields = [
            "gender",
            "married",
            "dependents",
            "education",
            "self_employed",
            "applicant_income",
            "coapplicant_income",
            "loan_amount",
            "loan_amount_term",
            "credit_history",
            "property_area",
            "purpose"
        ]

        for field in required_fields:
            if field not in data or data[field] == "":
                return jsonify({"error": f"{field} is required"}), 400

        credit_score = calculate_credit_score(
            gender=data["gender"],
            married=data["married"],
            dependents=data["dependents"],
            education=data["education"],
            self_employed=data["self_employed"],
            applicant_income=float(data["applicant_income"]),
            coapplicant_income=float(data["coapplicant_income"]),
            loan_amount=float(data["loan_amount"]),
            loan_amount_term=float(data["loan_amount_term"]),
            credit_history=float(data["credit_history"]),
            property_area=data["property_area"]
        )

        score_label = get_score_label(credit_score)

        result = create_loan_application(
            user_id=user_id,
            gender=data["gender"],
            married=data["married"],
            dependents=data["dependents"],
            education=data["education"],
            self_employed=data["self_employed"],
            applicant_income=float(data["applicant_income"]),
            coapplicant_income=float(data["coapplicant_income"]),
            loan_amount=float(data["loan_amount"]),
            loan_amount_term=float(data["loan_amount_term"]),
            credit_history=float(data["credit_history"]),
            property_area=data["property_area"],
            purpose=data["purpose"],
            credit_score=credit_score,
            score_label=score_label
        )

        return jsonify(result), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/v1/loans/my-applications", methods=["GET"], strict_slashes=False)
def my_applications():
    token, error_response, status_code = extract_bearer_token()
    if error_response:
        return error_response, status_code

    user = get_user_by_token(token)
    if not user:
        return jsonify({"error": "Invalid or expired token"}), 401

    user_id = user["id"]
    email = user["email"]
    full_name = user["full_name"]
    role = user["role"]

    if role != "customer":
        return jsonify({"error": "Access denied. Customers only."}), 403

    try:
        applications = get_user_applications(user_id)
        return jsonify(applications), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/v1/loans/pending", methods=["GET"])
def pending_loans():
    token, error_response, status_code = extract_bearer_token()
    if error_response:
        return error_response, status_code

    user = get_user_by_token(token)
    if not user:
        return jsonify({"error": "Invalid or expired token"}), 401
    
    user_id = user["id"]
    email = user["email"]
    full_name = user["full_name"]
    role = user["role"]

    if role != "credit_officer":
        return jsonify({"error": "Access denied. Officers only."}), 403

    try:
        applications = get_pending_loans()
        return jsonify(applications), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/v1/loans/<int:loan_id>/action", methods=["PUT"])
def loan_action(loan_id):
    token, error_response, status_code = extract_bearer_token()
    if error_response:
        return error_response, status_code

    data = request.get_json()

    if not data:
        return jsonify({"error": "JSON body is required"}), 400

    user = get_user_by_token(token)
    if not user:
        return jsonify({"error": "Invalid or expired token"}), 401

    user_id = user["id"]
    email = user["email"]
    full_name = user["full_name"]
    role = user["role"]

    if role != "credit_officer":
        return jsonify({"error": "Access denied. Officers only."}), 403

    action = data.get("action")
    comments = data.get("comments")

    if action not in ["approved", "rejected"]:
        return jsonify({"error": "Action must be 'approved' or 'rejected'"}), 400

    if not comments or comments.strip() == "":
        return jsonify({"error": "Comments are required"}), 400

    try:
        result = update_loan_status(loan_id, action, user_id, comments)
        status = result.pop("status")
        return jsonify(result), status

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/v1/loans/<int:loan_id>/ai-review", methods=["POST"])
def generate_loan_ai_review(loan_id):
    token, error_response, status_code = extract_bearer_token()
    if error_response:
        return error_response, status_code

    user = get_user_by_token(token)
    if not user:
        return jsonify({"error": "Invalid or expired token"}), 401

    user_id = user["id"]
    email = user["email"]
    full_name = user["full_name"]
    role = user["role"]

    if role != "credit_officer":
        return jsonify({"error": "Access denied. Officers only."}), 403

    result = generate_ai_review_for_loan(loan_id)
    status = result.pop("status")
    return jsonify(result), status


if __name__ == "__main__":
    app.run(debug=True)