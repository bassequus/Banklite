# BankLite – Smart Loan Origination System

BankLite is a role-based full-stack web application that simulates a commercial banking Loan Origination System (LOS). It covers customer onboarding into the loan process, automated mock credit scoring, officer-side underwriting, audit logging, and status tracking through a React frontend and Flask backend.

## Project overview

The application models a simplified consumer lending workflow in five review stages:

1. **Authentication and identity access** – users sign in as either customer or credit officer.
2. **Application capture** – customers submit a loan request with amount, purpose, and monthly income.
3. **Automated credit review** – the backend generates a mock credit score for initial risk classification.
4. **Manual underwriting decision** – credit officers review pending applications and approve or reject them with comments.
5. **Audit and decision traceability** – every underwriting action is stored in audit logs for review and accountability.

This structure mirrors the practical separation between borrower actions, system-side risk processing, and manual credit control in retail or commercial lending workflows.

## Core features

### Customer features
- Secure login flow with role-based routing.
- Loan application form for amount, purpose, and monthly income.
- Personal dashboard showing submitted applications.
- Real-time viewing of loan status: pending, approved, or rejected.
- Logout support and protected page access.

### Credit officer features
- Officer dashboard with a global queue of pending applications.
- Recharts PieChart visualization for pending loan risk distribution.
- Underwriting console for manual decision-making.
- Mandatory officer comments before approval or rejection.
- Logout support and protected routes.

### System features
- Role-based access control using stored session tokens.
- REST API integration between React frontend and Flask backend.
- Mock credit score generation in the backend.
- Audit log creation for underwriting actions.
- Responsive professional dashboard-style interface.

## Five-stage credit review flow

| Stage | Description | Primary Actor | Output |
|------|-------------|---------------|--------|
| 1 | Login and access validation | Customer / Officer | Auth token and role session |
| 2 | Loan application submission | Customer | Pending loan application |
| 3 | Mock credit score generation | Backend system | Risk score between 300 and 850 |
| 4 | Manual underwriting decision | Credit officer | Approved or rejected outcome |
| 5 | Audit logging and status tracking | System | Decision history and updated status |

## Tech stack

| Layer | Technology |
|------|------------|
| Frontend | React.js, React Router, Recharts, CSS |
| Backend | Python, Flask, Flask-CORS |
| Database | SQLite or PostgreSQL |
| API Testing | Postman |
| Development Tools | VS Code, Git, npm |

## System modules

### Frontend pages
- `LoginPage`
- `CustomerDashboard`
- `LoanApplicationForm`
- `OfficerDashboard`
- `UnderwritingConsole`
- `ProtectedRoute`

### Backend modules
- Authentication handler
- Loan application submission API
- Customer application retrieval API
- Officer pending queue API
- Underwriting action API
- Audit log insertion logic

## Suggested project structure

```bash
BankLite/
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── requirements.txt
│   └── database.db
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Database design

The application uses three main tables:

### `users`
Stores login and role details.
- `id`
- `email`
- `password_hash`
- `full_name`
- `role`
- `session_token`

### `loan_applications`
Stores loan requests and decision status.
- `id`
- `user_id`
- `amount`
- `purpose`
- `monthly_income`
- `credit_score`
- `status`
- `created_at`

### `audit_logs`
Stores underwriting actions by officers.
- `id`
- `application_id`
- `officer_id`
- `action`
- `comments`
- `timestamp`

## API endpoints

| Method | Endpoint | Access | Purpose |
|-------|----------|--------|---------|
| POST | `/api/v1/auth/login` | Public | Authenticate user and generate token |
| POST | `/api/v1/loans/apply` | Customer | Submit a new loan application |
| GET | `/api/v1/loans/my-applications` | Customer | View customer’s own applications |
| GET | `/api/v1/loans/pending` | Officer | View pending loan queue |
| PUT | `/api/v1/loans/<id>/action` | Officer | Approve or reject an application |

## Setup instructions

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd BankLite
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

If CORS is required for local development, install and configure Flask-CORS in the Flask app.

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Production build

```bash
npm run build
```

## Demo accounts

Use seeded test accounts for demonstration:

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@banklite.com | password123 |
| Credit Officer | officer@banklite.com | password123 |

Update these credentials based on the records inserted into the local database.

## Workflow demonstration

### Customer journey
1. Log in as customer.
2. Open the customer dashboard.
3. Submit a new loan application.
4. View the application in the personal applications table.
5. Observe the initial status as `pending`.

### Officer journey
1. Log in as credit officer.
2. Open the pending application queue.
3. Review the risk chart and selected application details.
4. Enter mandatory comments.
5. Approve or reject the application.
6. Verify that the audit log and application status are updated.

## UI highlights

- Professional responsive dashboard layout.
- Card-based interface for forms, tables, and data summaries.
- Color-coded badges for application status and risk bands.
- Recharts PieChart for pending loan segmentation.
- Shared CSS system for consistent visual design across all pages.

## Interview talking points

This project is useful for internship and interview discussions because it demonstrates:

- Full-stack integration using React and Flask.
- Role-based access control.
- REST API design and protected endpoints.
- Database modeling with relational tables and foreign keys.
- State management with React hooks.
- Business workflow implementation in a banking domain.
- Auditability and traceability in financial decision systems.
- Data visualization with Recharts.

## Future enhancements

- JWT-based authentication instead of database-stored session tokens.
- Proper password hashing using `werkzeug.security`.
- Dedicated endpoint to fetch a single application by ID.
- Advanced credit decision rules based on debt-to-income ratio.
- Search and filter support for officer dashboards.
- Exportable audit reports.
- Deployment using Vercel for frontend and Render/Railway for backend.
- Unit and integration testing.

## Screenshots to add

Replace this section with actual project screenshots before pushing to GitHub:

- Login page
- Customer dashboard
- Loan application form
- Officer dashboard with risk chart
- Underwriting console

## Conclusion

BankLite is a practical academic and portfolio-grade LOS prototype that demonstrates how a five-stage credit review workflow can be implemented with modern full-stack tools. The project combines frontend UI engineering, backend API design, database relationships, role-based security, and business-domain modeling in a single interview-ready application.
