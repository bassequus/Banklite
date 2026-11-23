# BankLite — Explainable Loan Application Decision Support

BankLite is an academic full-stack loan workflow prototype built with React, Flask, and PostgreSQL. It combines a rule-based credit score with a Random Forest prediction and SHAP feature contributions to support human review of loan applications.

The ML output is a recommendation, not a final lending decision. Applications remain pending until processed through the officer workflow.

## Features

### Customer workflow
- Customer authentication and dashboard.
- Loan application submission.
- Application status tracking.

### Officer workflow
- Pending application queue and underwriting console.
- Approval or rejection with mandatory comments.
- Credit score visualisation.
- Existing AI-assisted application review functionality.

### Explainable ML extension
- Separate training script comparing Logistic Regression, Random Forest, and XGBoost.
- Random Forest selected for deployment based on class-0 recall in the current experiment.
- Existing rule-based scoring retained alongside ML predictions.
- Loan application response includes model output and the three largest absolute SHAP contributions.
- Exported comparison results and global/local SHAP figures.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, Vite, React Router, Recharts |
| Backend | Python, Flask, Flask-CORS |
| Database | PostgreSQL, psycopg2 |
| Machine learning | scikit-learn, XGBoost |
| Explanations | SHAP |
| Supporting libraries | pandas, NumPy, Matplotlib, joblib |

## Project Structure

```text
Banklite/
├── backend/
│   ├── app.py
│   ├── scoring.py
│   ├── services.py
│   ├── config.py
│   ├── db.py
│   ├── requirements.txt
│   ├── utils/
│   └── models/
│       ├── train_model_v2.py
│       ├── predict_service.py
│       ├── best_model.pkl
│       ├── feature_columns.pkl
│       ├── model_comparison_results.csv
│       ├── processed_data/
│       │   └── loan_approval_cleaned.csv
│       └── figures/
│           ├── shap_beeswarm.png
│           ├── shap_importance.png
│           └── shap_waterfall.png
├── frontend/
├── database/
│   └── schema.sql
└── README.md
```

The structure shows expected local files. Dataset and trained artefacts may need to be obtained or generated separately if they are not committed.

## Prerequisites

- Python 3.10 or later, with versions compatible with the model artefacts.
- Node.js and npm compatible with the frontend package requirements.
- PostgreSQL running locally.
- Git.

## Local Setup — Windows PowerShell

### 1. Clone the repository

```powershell
git clone https://github.com/bassequus/Banklite.git
cd Banklite
```

If working from an existing local checkout, use that folder instead.

### 2. Set up the backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

If the ML dependencies are not yet listed in `requirements.txt`, install them in the active environment:

```powershell
python -m pip install scikit-learn xgboost shap pandas numpy matplotlib joblib
```

For reproducible results, record and pin the versions from the environment used to train the saved model. Installing current versions does not guarantee compatibility with existing pickle files.

### 3. Configure PostgreSQL and external services

- Create the local database and inspect/apply `database/schema.sql` as appropriate for your PostgreSQL installation.
- Configure database access according to `backend/config.py` and `backend/db.py`.
- Inspect `backend/utils/ai_review.py` for any external-service configuration required by the optional AI review feature.
- Keep real credentials in environment variables or another local, untracked configuration mechanism. Do not commit passwords, API keys, session tokens, or database backups.

Exact environment-variable names depend on the implementation; this README does not prescribe names that the code may not read.

### 4. Prepare the ML artefacts

The prediction service expects these files:

```text
backend/models/best_model.pkl
backend/models/feature_columns.pkl
```

If they are absent, obtain the authorised dataset and run training from the backend directory:

```powershell
python models	rain_model_v2.py
```

The current training script expects:

```text
models/processed_data/loan_approval_cleaned.csv
```

The dataset target column is `loan_status`. Verify the dataset source, licence, label mapping, and preprocessing before reuse or redistribution. Only load pickle/joblib artefacts from trusted sources.

### 5. Start Flask

From the backend directory, with the virtual environment activated:

```powershell
python app.py
```

The local API is expected at `http://127.0.0.1:5000`; check the terminal output for the actual address.

### 6. Start React in a second terminal

From the repository root:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`, or the address printed by Vite. The loan application route currently permits the frontend origin `http://localhost:5173`; keep the origin and CORS configuration consistent.

### 7. Sign in and submit an application

Use a customer account for loan submission. The existing backend exposes registration at `POST /api/v1/auth/register` and login at `POST /api/v1/auth/login`. The current frontend may require accounts to be created through the API rather than through a registration page.

Do not expose an unrestricted role-selection registration endpoint publicly without reviewing access controls.

## Routes

### Frontend

| Route | Purpose |
|---|---|
| `/` | Login |
| `/customer` | Customer dashboard |
| `/apply` | Loan application form |
| `/officer` | Officer dashboard |
| `/underwrite/:id` | Underwriting console |
| `/ai-review/:loanId` | AI review screen |

### Backend

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/auth/register` | Account registration |
| POST | `/api/v1/auth/login` | Login and session token |
| POST | `/api/v1/loans/apply` | Submit application and return scoring output |
| GET | `/api/v1/loans/my-applications` | Customer application history |
| GET | `/api/v1/loans/pending` | Pending application queue |
| PUT | `/api/v1/loans/<id>/action` | Officer decision |
| POST | `/api/v1/loans/<id>/ai-review` | Generate an AI-assisted review |

The existing application uses database-backed session tokens. Do not assume these tokens are JWTs.

## Testing the Loan Endpoint in Postman

1. Log in through `/api/v1/auth/login` using a customer account.
2. Copy the returned session token.
3. Create a `POST` request to `http://127.0.0.1:5000/api/v1/loans/apply`.
4. Set Authorization to Bearer Token and paste the token.
5. Select Body → raw → JSON and send all required fields.

Example request for integration testing only:

```json
{
  "gender": "Male",
  "married": "Yes",
  "dependents": "1",
  "education": "Graduate",
  "self_employed": "No",
  "applicant_income": 50000,
  "coapplicant_income": 20000,
  "loan_amount": 200000,
  "loan_amount_term": 360,
  "credit_history": 1,
  "property_area": "Semiurban",
  "purpose": "Home Loan"
}
```

Verify that income, loan amount, and term units match training preprocessing before interpreting a prediction.

An observed local response included:

```json
{
  "application_id": 56,
  "credit_score": 100,
  "message": "Loan application submitted successfully",
  "ml_prediction": {
    "approval_probability": 0.41,
    "approved": false,
    "risk_score": 59.0,
    "top_reasons": [
      {"direction": "decreases approval chance", "feature": "coapplicantincome", "impact": -0.1005},
      {"direction": "decreases approval chance", "feature": "loan_amount_term", "impact": -0.0597},
      {"direction": "increases approval chance", "feature": "credit_history", "impact": 0.051}
    ]
  },
  "score_label": "Excellent",
  "status": "pending"
}
```

This is an integration example, not a guaranteed response for every installation or a validated assessment of the applicant.

### Understanding the output

- `credit_score` and `score_label`: existing rule-based output, separate from the model.
- `approval_probability`: name used by the API for its selected class probability. Confirm that the training label mapping and `model.classes_` identify that class as approval.
- `approved`: threshold-based model recommendation; the current service uses 0.5.
- `risk_score`: `100 × (1 − approval_probability)`, not a validated probability of default.
- `top_reasons`: three largest absolute SHAP contributions, including both positive and negative contributions.
- `status`: application workflow state. A negative model recommendation does not itself change `pending` to a final rejection.

The displayed SHAP contributions alone do not sum to the prediction: the baseline and all remaining feature contributions are also required. SHAP explains model behaviour, not causal effects or regulatory compliance.

## Model Experiment

The recorded experiment used 614 rows and 14 columns in the cleaned input table, with `loan_status` as the target. The logged model matrices contained 14 encoded input features. Raw column counts and encoded feature counts are not interchangeable.

- One stratified 80/20 split.
- Training records: 491.
- Test records: 123.
- Random seed: 42.
- Test support: class 0 = 38; class 1 = 85.
- Logistic Regression used feature scaling to address convergence.

### Explicit model settings

| Model | Settings supplied in the model definition |
|---|---|
| Logistic Regression | `max_iter=5000`, `random_state=42`, `class_weight="balanced"` |
| Random Forest | `n_estimators=100`, `random_state=42`, `class_weight="balanced"` |
| XGBoost | `n_estimators=100`, `max_depth=4`, `learning_rate=0.1`, `random_state=42`, `eval_metric="logloss"` |

### Recorded test results

| Model | Accuracy | ROC-AUC | Precision (0) | Recall (0) | F1 (0) |
|---|---:|---:|---:|---:|---:|
| Logistic Regression | 0.8374 | 0.8740 | 0.7250 | 0.7632 | 0.7436 |
| Random Forest | 0.8618 | 0.8523 | 0.7692 | 0.7895 | 0.7792 |
| XGBoost | 0.8455 | 0.8241 | 0.8065 | 0.6579 | 0.7246 |

| Model | Precision (1) | Recall (1) | F1 (1) |
|---|---:|---:|---:|
| Logistic Regression | 0.8916 | 0.8706 | 0.8810 |
| Random Forest | 0.9048 | 0.8941 | 0.8994 |
| XGBoost | 0.8587 | 0.9294 | 0.8927 |

Random Forest had the highest accuracy and class-0 recall in this split and was selected for deployment. Logistic Regression had the highest ROC-AUC. The model-selection log should describe the actual criterion rather than incorrectly claiming Random Forest won by ROC-AUC.

These are single-split results, without cross-validation, confidence intervals, or an independent final evaluation after model selection. They do not demonstrate statistical superiority or production readiness.

## SHAP Outputs

Training exports:

- `shap_beeswarm.png`: distribution of test-instance contributions.
- `shap_importance.png`: global feature importance plot.
- `shap_waterfall.png`: local explanation for test applicant index 0; do not assume this applicant was rejected without checking the prediction.

The API service uses `shap.TreeExplainer(model)` without an explicit background dataset. Offline figures were generated using a background dataset, so the explanation configurations differ and may produce different attributions. Align and document these configurations before comparing explanations directly.

## Limitations and Validation Priorities

This is an educational prototype, not an automated lending product.

- Verify the exact dataset source and redistribution licence.
- Verify whether target labels represent approval decisions; do not describe them as observed defaults without evidence.
- Confirm the class-to-probability mapping against `model.classes_`.
- Match deployment feature names, categorical encodings, missing-value handling, derived-feature formulas, and units to training exactly. Filling missing encoded columns with zero can conceal schema errors.
- Evaluate repeated splits/cross-validation and use a separate evaluation strategy for model selection.
- Assess calibration before treating class probabilities as reliable frequencies.
- Audit sensitive attributes and proxies; the application currently accepts gender and marital status, and no fairness audit has been reported.
- No first-time/thin-file subgroup performance, repayment-outcome validation, explanation-stability audit, or regulatory-compliance assessment has been established.
- Do not infer causation or guaranteed applicant improvement from SHAP contributions.
- Review input validation, role assignment, error handling, secret management, authentication, and logging before deployment.
- The returned ML payload is not necessarily persisted or displayed on officer dashboards unless those integrations are implemented separately.

## Academic Context

Developed for the fifth-semester course CSE2267: Machine Learning Techniques at Presidency University, Bengaluru.

AI assistance was used for implementation suggestions, debugging, documentation, LaTeX formatting, and drafting/revising research text. The author is responsible for verifying the implementation, references, experimental results, and final interpretation, and for following course disclosure requirements.

## Data and Security

Do not commit `.env` files, private keys, session tokens, real applicant records, database dumps, `.venv`, or `node_modules`. Use sanitised examples for demonstrations. Dataset licensing is separate from the repository's code licence; check both before reuse.
