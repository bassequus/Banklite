def calculate_credit_score(
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
    ):
    score = 50

    total_income = float(applicant_income) + float(coapplicant_income)   # monthly income in rupees
    annual_income = total_income * 12
    loan_amount_value = float(loan_amount)                               # raw rupees
    loan_term_value = float(loan_amount_term)
    credit_history_value = float(credit_history)

    if credit_history_value == 1:
        score += 25
    else:
        score -= 20

    if total_income >= 80000:
        score += 12
    elif total_income >= 50000:
        score += 8
    elif total_income >= 25000:
        score += 4
    else:
        score -= 6

    if annual_income > 0:
        loan_to_income_ratio = loan_amount_value / annual_income

        if loan_to_income_ratio <= 0.50:
            score += 12
        elif loan_to_income_ratio <= 1.00:
            score += 6
        elif loan_to_income_ratio <= 2.00:
            score += 0
        else:
            score -= 12

    if education == "Graduate":
        score += 5

    if married == "Yes":
        score += 2

    if dependents == "1":
        score -= 1
    elif dependents == "2":
        score -= 3
    elif dependents == "3+":
        score -= 5

    if self_employed == "Yes":
        score -= 2

    if loan_term_value <= 180:
        score += 5
    elif loan_term_value <= 360:
        score += 2
    else:
        score -= 4

    if property_area == "Semiurban":
        score += 3
    elif property_area == "Urban":
        score += 2

    if gender == "Female":
        score += 1

    score = max(0, min(100, round(score)))
    return score


def get_score_label(score):
    if score >= 80:
        return "Excellent"
    elif score >= 70:
        return "Very Good"
    elif score >= 60:
        return "Good"
    elif score >= 50:
        return "Fair"
    else:
        return "Poor"