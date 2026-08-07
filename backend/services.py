from db import get_connection
from utils.ai_review import generate_ai_review
import uuid
from werkzeug.security import generate_password_hash, check_password_hash
from flask import request

def hash_password(password):
    return generate_password_hash(password)

def get_user_by_token(token):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT id, email, full_name, role
            FROM users
            WHERE session_token = %s
            """,
            (token,)
        )

        row = cur.fetchone()
        if not row:
            return None

        return {
            "id": row[0],
            "email": row[1],
            "full_name": row[2],
            "role": row[3]
        }
    finally:
        cur.close()
        conn.close()


def create_user(full_name, email, password, role):
    """
    Create a new user in the database.

    Args:
        full_name (str): User full name
        email (str): User email
        password (str): Plain text password
        role (str): User role

    Returns:
        dict: Result message and status
    """
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            "SELECT id FROM users WHERE email = %s",
            (email,)
        )
        existing_user = cur.fetchone()

        if existing_user:
            cur.close()
            conn.close()
            return {"error": "User already exists with this email", "status": 409}

        password_hash = generate_password_hash(password)

        cur.execute(
            """
            INSERT INTO users (full_name, email, password_hash, role, session_token)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, full_name, email, role
            """,
            (full_name, email, password_hash, role, None)
        )

        new_user = cur.fetchone()
        conn.commit()

        cur.close()
        conn.close()

        return {
            "message": "User registered successfully",
            "user": {
                "id": new_user[0],
                "full_name": new_user[1],
                "email": new_user[2],
                "role": new_user[3]
            },
            "status": 201
        }

    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {"error": str(e), "status": 500}
    
def authenticate_user(email, password):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            "SELECT id, full_name, role, password_hash FROM users WHERE email = %s",
            (email,)
        )
        user = cur.fetchone()

        if not user:
            return {"error": "Invalid email or password", "status": 401}

        user_id, full_name, role, password_hash = user

        if not check_password_hash(password_hash, password):
            return {"error": "Invalid email or password", "status": 401}

        session_token = str(uuid.uuid4())

        cur.execute(
            "UPDATE users SET session_token = %s WHERE id = %s",
            (session_token, user_id)
        )
        conn.commit()

        return {
            "message": "Login successful",
            "token": session_token,
            "full_name": full_name,
            "role": role,
            "status": 200
        }

    except Exception as e:
        conn.rollback()
        return {"error": str(e), "status": 500}

    finally:
        cur.close()
        conn.close()

def create_loan_application(
    user_id,
    gender,
    married,
    dependents,
    education,
    self_employed,
    applicant_income,
    coapplicant_income,
    loan_amount,
    loan_amount_term,
    credit_history,
    property_area,
    purpose,
    credit_score,
    score_label,
    status="pending"
):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
    """
    INSERT INTO loan_applications (
        user_id,
        amount,
        monthly_income,
        purpose,
        credit_score,
        score_label,
        status,
        gender,
        married,
        dependents,
        education,
        self_employed,
        applicant_income,
        coapplicant_income,
        loan_amount,
        loan_amount_term,
        credit_history,
        property_area
    )
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    RETURNING id, status, credit_score, score_label
    """,
    (
        user_id,
        loan_amount,
        applicant_income,
        purpose,
        credit_score,
        score_label,
        status,
        gender,
        married,
        dependents,
        education,
        self_employed,
        applicant_income,
        coapplicant_income,
        loan_amount,
        loan_amount_term,
        credit_history,
        property_area
    )
)

        result = cur.fetchone()
        conn.commit()

        return {
            "message": "Loan application submitted successfully",
            "application_id": result[0],
            "status": result[1],
            "credit_score": result[2],
            "score_label": result[3]                    
        }

    except Exception:
        conn.rollback()
        raise

    finally:
        cur.close()
        conn.close()


def get_user_applications(user_id):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT
                id,
                user_id,
                amount,
                monthly_income,
                purpose,
                credit_score,
                score_label,
                status,
                created_at,
                gender,
                married,
                dependents,
                education,
                self_employed,
                applicant_income,
                coapplicant_income,
                loan_amount,
                loan_amount_term,
                credit_history,
                property_area
            FROM loan_applications
            WHERE user_id = %s
            ORDER BY created_at DESC, id DESC
            """,
            (user_id,)
        )

        rows = cur.fetchall()

        applications = []
        for row in rows:
            applications.append({
                "id": row[0],
                "user_id": row[1],
                "amount": float(row[2]) if row[2] is not None else None,
                "monthly_income": float(row[3]) if row[3] is not None else None,
                "purpose": row[4],
                "credit_score": float(row[5]) if row[5] is not None else None,
                "score_label": row[6],
                "status": row[7],
                "created_at": row[8].isoformat() if row[8] else None,
                "gender": row[9],
                "married": row[10],
                "dependents": row[11],
                "education": row[12],
                "self_employed": row[13],
                "applicant_income": float(row[14]) if row[14] is not None else None,
                "coapplicant_income": float(row[15]) if row[15] is not None else None,
                "loan_amount": float(row[16]) if row[16] is not None else None,
                "loan_amount_term": float(row[17]) if row[17] is not None else None,
                "credit_history": float(row[18]) if row[18] is not None else None,
                "property_area": row[19]
            })

        return applications

    finally:
        cur.close()
        conn.close()

def get_pending_loans():
    """
    Retrieve all pending loan applications.
    
    Returns:
        list: List of pending loan applications
    """
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

    return applications


def update_loan_status(loan_id, action, officer_id, comments):
    """
    Update loan application status and add audit log.
    
    Args:
        loan_id (int): Loan application ID
        action (str): Action ('approved' or 'rejected')
        officer_id (int): Officer ID performing the action
        comments (str): Officer's comments
        
    Returns:
        dict: Result of update operation
    """
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
        return {"error": "Loan application not found", "status": 404}

    app_id, current_status = application

    if current_status != "pending":
        cur.close()
        conn.close()
        return {"error": f"Loan already {current_status}", "status": 400}

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

    return {
        "message": f"Loan application {action} successfully",
        "application_id": loan_id,
        "action": action,
        "officer_id": officer_id,
        "comments": comments,
        "status": 200
    }


def generate_ai_review_for_loan(loan_id):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT
                id,
                gender,
                married,
                dependents,
                education,
                self_employed,
                applicant_income,
                coapplicant_income,
                loan_amount,
                loan_amount_term,
                credit_history,
                property_area
            FROM loan_applications
            WHERE id = %s
            """,
            (loan_id,)
        )
        row = cur.fetchone()

        if row is None:
            return {"error": "Loan application not found", "status": 404}

        application_data = {
            "loan_id": row[0],
            "gender": row[1],
            "married": row[2],
            "dependents": row[3],
            "education": row[4],
            "self_employed": row[5],
            "applicant_income": float(row[6]) if row[6] is not None else 0.0,
            "coapplicant_income": float(row[7]) if row[7] is not None else 0.0,
            "loan_amount": float(row[8]) if row[8] is not None else 0.0,
            "loan_amount_term": float(row[9]) if row[9] is not None else 0.0,
            "credit_history": int(row[10]) if row[10] is not None else 0,
            "property_area": row[11]
        }

        review_result = generate_ai_review(application_data)

        cur.execute(
            """
            INSERT INTO ai_reviews (
                application_id,
                prediction,
                confidence,
                approval_probability,
                rejection_probability,
                recommendation
            ) VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                loan_id,
                review_result["prediction"],
                review_result["confidence"],
                review_result["approval_probability"],
                review_result["rejection_probability"],
                review_result["recommendation"]
            )
        )

        conn.commit()

        return {
            "message": "AI review generated successfully",
            "loan_id": loan_id,
            "ai_review": review_result,
            "status": 200
        }

    except Exception as e:
        conn.rollback()
        return {"error": str(e), "status": 500}

    finally:
        cur.close()
        conn.close()