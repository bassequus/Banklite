from flask import Flask, jsonify, request
from flask_cors import CORS
from db import get_connection
import uuid
import random

app = Flask(__name__)
CORS(app)

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
        conn = get_connection()
        cur = conn.cursor()

        cur.execute(
            "SELECT id, full_name, role, password_hash FROM users WHERE email = %s",
            (email,)
        )
        user = cur.fetchone()

        if not user:
            cur.close()
            conn.close()
            return jsonify({"error": "Invalid email or password"}), 401

        user_id, full_name, role, password_hash = user

        if password != password_hash:
            cur.close()
            conn.close()
            return jsonify({"error": "Invalid email or password"}), 401

        token = str(uuid.uuid4())

        cur.execute(
            "UPDATE users SET session_token = %s WHERE id = %s",
            (token, user_id)
        )
        conn.commit()

        cur.close()
        conn.close()

        return jsonify({
            "message": "Login successful",
            "token": token,
            "full_name": full_name,
            "role": role
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_user_by_token(token):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT id, email, full_name, role FROM users WHERE session_token = %s",
        (token,)
    )
    user = cur.fetchone()

    cur.close()
    conn.close()
    return user

@app.route("/api/v1/loans/apply", methods=["POST"])
def apply_loan():
    token = request.headers.get("Authorization")
    data = request.get_json()

    if not token:
        return jsonify({"error": "Authorization token required"}), 401

    if not data:
        return jsonify({"error": "JSON body is required"}), 400

    user = get_user_by_token(token)
    if not user:
        return jsonify({"error": "Invalid or expired token"}), 401

    user_id, email, full_name, role = user

    if role != "customer":
        return jsonify({"error": "Access denied. Customers only."}), 403

    amount = data.get("amount")
    purpose = data.get("purpose")
    monthly_income = data.get("monthly_income")

    if not amount or not purpose or not monthly_income:
        return jsonify({"error": "All fields are required"}), 400

    credit_score = random.randint(300, 850)

    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO loan_applications
            (user_id, amount, purpose, monthly_income, credit_score, status)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (user_id, amount, purpose, monthly_income, credit_score, "pending"))

        application_id = cur.fetchone()[0]
        conn.commit()

        cur.close()
        conn.close()

        return jsonify({
            "message": "Loan application submitted successfully",
            "application_id": application_id,
            "credit_score": credit_score,
            "status": "pending"
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/v1/loans/my-applications", methods=["GET"])
def my_applications():
    token = request.headers.get("Authorization")

    if not token:
        return jsonify({"error": "Authorization token required"}), 401

    user = get_user_by_token(token)
    if not user:
        return jsonify({"error": "Invalid or expired token"}), 401

    user_id, email, full_name, role = user

    if role != "customer":
        return jsonify({"error": "Access denied. Customers only."}), 403

    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT id, amount, purpose, monthly_income, credit_score, status, created_at
            FROM loan_applications
            WHERE user_id = %s
            ORDER BY created_at DESC
        """, (user_id,))

        rows = cur.fetchall()

        cur.close()
        conn.close()

        applications = []
        for row in rows:
            applications.append({
                "id": row[0],
                "amount": float(row[1]),
                "purpose": row[2],
                "monthly_income": float(row[3]),
                "credit_score": row[4],
                "status": row[5],
                "created_at": str(row[6])
            })

        return jsonify(applications), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/v1/loans/pending", methods=["GET"])
def pending_loans():
    token = request.headers.get("Authorization")

    if not token:
        return jsonify({"error": "Authorization token required"}), 401

    user = get_user_by_token(token)
    if not user:
        return jsonify({"error": "Invalid or expired token"}), 401

    user_id, email, full_name, role = user

    if role != "credit_officer":
        return jsonify({"error": "Access denied. Officers only."}), 403

    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT id, user_id, amount, purpose, monthly_income, credit_score, status, created_at
            FROM loan_applications
            WHERE status = %s
            ORDER BY created_at DESC
        """, ("pending",))

        rows = cur.fetchall()

        cur.close()
        conn.close()

        applications = []
        for row in rows:
            applications.append({
                "id": row[0],
                "user_id": row[1],
                "amount": float(row[2]),
                "purpose": row[3],
                "monthly_income": float(row[4]),
                "credit_score": row[5],
                "status": row[6],
                "created_at": str(row[7])
            })

        return jsonify(applications), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/v1/loans/<int:loan_id>/action", methods=["PUT"])
def loan_action(loan_id):
    token = request.headers.get("Authorization")
    data = request.get_json()

    if not token:
        return jsonify({"error": "Authorization token required"}), 401

    user = get_user_by_token(token)
    if not user:
        return jsonify({"error": "Invalid or expired token"}), 401

    officer_id, email, full_name, role = user

    if role != "credit_officer":
        return jsonify({"error": "Access denied. Officers only."}), 403

    action = data.get("action")
    comments = data.get("comments")

    if action not in ["approved", "rejected"]:
        return jsonify({"error": "Action must be 'approved' or 'rejected'"}), 400

    if not comments or comments.strip() == "":
        return jsonify({"error": "Comments are required"}), 400

    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute(
            "SELECT id, status FROM loan_applications WHERE id = %s",
            (loan_id,)
        )
        application = cur.fetchone()

        if not application:
            cur.close()
            conn.close()
            return jsonify({"error": "Loan application not found"}), 404

        app_id, current_status = application

        if current_status != "pending":
            cur.close()
            conn.close()
            return jsonify({"error": f"Loan already {current_status}"}), 400

        cur.execute(
            "UPDATE loan_applications SET status = %s WHERE id = %s",
            (action, loan_id)
        )

        cur.execute("""
            INSERT INTO audit_logs (application_id, officer_id, action, comments)
            VALUES (%s, %s, %s, %s)
        """, (loan_id, officer_id, action, comments))

        conn.commit()

        cur.close()
        conn.close()

        return jsonify({
            "message": f"Loan application {action} successfully",
            "application_id": loan_id,
            "action": action,
            "officer_id": officer_id,
            "comments": comments
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
  
if __name__ == "__main__":
    app.run(debug=True)