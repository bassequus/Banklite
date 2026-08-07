# BankLite – Smart Loan Origination System

BankLite is a role-based full-stack loan workflow demo built with React on the frontend and Flask on the backend. The current implementation supports customer login, loan application submission, automated credit scoring, officer review, mandatory underwriting comments, and AI-assisted review for pending applications.

## What the app does today

The current workflow follows these steps:

1. A user logs in through the React frontend.
2. The backend validates credentials and returns a session token.
3. A customer submits a loan application with applicant, financial, and property details.
4. The backend calculates a credit score and stores the application as pending.
5. A credit officer reviews pending applications from the officer dashboard.
6. The officer can approve or reject the application after entering comments.
7. The officer can also generate an AI review for the selected loan application.

## Current features

### Customer flow
- Login with role-based routing to the customer dashboard.
- View personal loan applications and their status.
- Submit a new loan application through the application form.
- Track application progress as pending, approved, or rejected.

### Officer flow
- Access a protected officer dashboard.
- View pending applications in a queue.
- See a credit score distribution chart for pending loans.
- Open an underwriting console for a selected application.
- Approve or reject applications only after entering comments.
- Generate an AI review for a loan application.

### Backend capabilities
- Flask REST API with protected routes.
- Token-based authentication using session tokens stored in the database.
- Credit scoring logic for loan applications.
- Audit log insertion for officer decisions.
- AI review generation for pending loan applications.

## Tech stack

| Layer | Technology |
|------|------------|
| Frontend | React, React Router, Vite, Recharts |
| Backend | Python, Flask, Flask-CORS, psycopg2 |
| Database | PostgreSQL |
| Styling | Custom CSS in the React app |

## Project structure

```bash
banklite/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── db.py
│   ├── services.py
│   ├── scoring.py
│   ├── requirements.txt
│   └── utils/
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── components/
│       └── pages/
├── database/
│   └── schema.sql
└── README.md
```

## Current routes

The frontend routes in the app are:

- `/` – login page
- `/customer` – customer dashboard
- `/apply` – loan application form
- `/officer` – officer dashboard
- `/underwrite/:id` – underwriting console
- `/ai-review/:loanId` – AI review screen

## API overview

The backend currently exposes these main endpoints:

| Method | Endpoint | Purpose |
|-------|----------|---------|
| POST | `/api/v1/auth/login` | Authenticate a user and return a token |
| POST | `/api/v1/auth/register` | Create a new customer or officer account |
| POST | `/api/v1/loans/apply` | Submit a new loan application |
| GET | `/api/v1/loans/my-applications` | Fetch applications for the logged-in customer |
| GET | `/api/v1/loans/pending` | Fetch pending applications for officers |
| PUT | `/api/v1/loans/<id>/action` | Approve or reject a loan application |
| POST | `/api/v1/loans/<id>/ai-review` | Generate an AI review for a loan application |

## Setup instructions

### 1. Prerequisites

- Python 3.10+
- Node.js and npm
- PostgreSQL running locally

### 2. Backend setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Make sure the PostgreSQL database settings in [backend/config.py](backend/config.py) match your local environment.

Start the backend:

```bash
python app.py
```

The API will run on `http://127.0.0.1:5000`.

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### 4. Create users and use the app

The current frontend does not include a registration page. Create a user through the backend register endpoint, then log in from the UI.

Example:

```bash
curl -X POST http://127.0.0.1:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Jane Doe","email":"jane@example.com","password":"password123","role":"customer"}'
```

Use the same email and password on the login screen.

## Suggested workflow

### Customer journey
1. Register a customer account.
2. Log in to the customer dashboard.
3. Open the loan application form.
4. Submit a complete application.
5. View the submitted application in the dashboard.

### Officer journey
1. Register or use an officer account with the role `credit_officer`.
2. Log in to the officer dashboard.
3. Review the pending loan queue.
4. Open a loan application in the underwriting console.
5. Enter mandatory comments and approve or reject the request.
6. Optionally generate an AI review for the application.

## Notes

- The backend currently expects PostgreSQL and uses the configuration file in [backend/config.py](backend/config.py).
- The app uses stored session tokens for authentication rather than JWT.
- The officer workflow requires comments before a decision can be submitted.

- Underwriting console
  <img width="1920" height="1021" alt="underwriting console page" src="https://github.com/user-attachments/assets/3f310dce-e325-4e65-a4af-f73e0b1c8b64" />


## Conclusion

BankLite is a practical academic and portfolio-grade LOS prototype that demonstrates how a five-stage credit review workflow can be implemented with modern full-stack tools. The project combines frontend UI engineering, backend API design, database relationships, role-based security, and business-domain modeling in a single interview-ready application.

