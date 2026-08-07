import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoanApplicationForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    gender: "",
    married: "",
    dependents: "",
    education: "",
    self_employed: "",
    applicant_income: "",
    coapplicant_income: "",
    loan_amount: "",
    loan_amount_term: "",
    credit_history: "",
    property_area: "",
    purpose: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.gender) {
      setError("Please select gender");
      return;
    }

    if (!formData.married) {
      setError("Please select marital status");
      return;
    }

    if (!formData.dependents) {
      setError("Please select dependents");
      return;
    }

    if (!formData.education) {
      setError("Please select education");
      return;
    }

    if (!formData.self_employed) {
      setError("Please select self employment status");
      return;
    }

    if (!formData.applicant_income || Number(formData.applicant_income) <= 0) {
      setError("Please enter a valid applicant income");
      return;
    }

    if (formData.coapplicant_income === "" || Number(formData.coapplicant_income) < 0) {
      setError("Please enter a valid coapplicant income");
      return;
    }

    if (!formData.loan_amount || Number(formData.loan_amount) <= 0) {
      setError("Please enter a valid loan amount");
      return;
    }

    if (!formData.loan_amount_term || Number(formData.loan_amount_term) <= 0) {
      setError("Please enter a valid loan amount term");
      return;
    }

    if (formData.credit_history === "") {
      setError("Please select credit history");
      return;
    }

    if (!formData.property_area) {
      setError("Please select property area");
      return;
    }

    if (!formData.purpose.trim()) {
      setError("Please select a loan purpose");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch("http://127.0.0.1:5000/api/v1/loans/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          gender: formData.gender,
          married: formData.married,
          dependents: formData.dependents,
          education: formData.education,
          self_employed: formData.self_employed,
          applicant_income: Number(formData.applicant_income),
          coapplicant_income: Number(formData.coapplicant_income),
          loan_amount: Number(formData.loan_amount),
          loan_amount_term: Number(formData.loan_amount_term),
          credit_history: Number(formData.credit_history),
          property_area: formData.property_area,
          purpose: formData.purpose
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to submit application");
        setLoading(false);
        return;
      }

      setSuccess("Loan application submitted successfully");

      setFormData({
        gender: "",
        married: "",
        dependents: "",
        education: "",
        self_employed: "",
        applicant_income: "",
        coapplicant_income: "",
        loan_amount: "",
        loan_amount_term: "",
        credit_history: "",
        property_area: "",
        purpose: ""
      });

      setTimeout(() => {
        navigate("/customer");
      }, 1200);
    } catch (err) {
      setError("Could not connect to backend");
    }

    setLoading(false);
  };

  return (
    <div className="page-wrap">
      <div className="top-bar">
        <div className="top-bar-left">
          <h2>Loan Application</h2>
          <p>Submit a new loan request for review</p>
        </div>

        <div className="btn-row">
          <button className="btn-secondary" onClick={() => navigate("/customer")}>
            Back
          </button>
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="content-card card-span-8">
          <div className="card-header">
            <div>
              <h3 className="card-title">Application Details</h3>
              <p className="section-subtitle">
                Fill in the required details to submit your loan request
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-grid two-col">
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="married">Married</label>
              <select
                id="married"
                name="married"
                value={formData.married}
                onChange={handleChange}
                required
              >
                <option value="">Select marital status</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dependents">Dependents</label>
              <select
                id="dependents"
                name="dependents"
                value={formData.dependents}
                onChange={handleChange}
                required
              >
                <option value="">Select dependents</option>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3+">3+</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="education">Education</label>
              <select
                id="education"
                name="education"
                value={formData.education}
                onChange={handleChange}
                required
              >
                <option value="">Select education</option>
                <option value="Graduate">Graduate</option>
                <option value="Not Graduate">Not Graduate</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="self_employed">Self Employed</label>
              <select
                id="self_employed"
                name="self_employed"
                value={formData.self_employed}
                onChange={handleChange}
                required
              >
                <option value="">Select option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="applicant_income">Applicant Income</label>
              <input
                id="applicant_income"
                type="number"
                name="applicant_income"
                placeholder="Enter applicant income"
                value={formData.applicant_income}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="coapplicant_income">Coapplicant Income</label>
              <input
                id="coapplicant_income"
                type="number"
                name="coapplicant_income"
                placeholder="Enter coapplicant income"
                value={formData.coapplicant_income}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="loan_amount">Loan Amount</label>
              <input
                id="loan_amount"
                type="number"
                name="loan_amount"
                placeholder="Enter requested loan amount"
                value={formData.loan_amount}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="loan_amount_term">Loan Amount Term</label>
              <input
                id="loan_amount_term"
                type="number"
                name="loan_amount_term"
                placeholder="Enter loan term"
                value={formData.loan_amount_term}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="credit_history">Credit History</label>
              <select
                id="credit_history"
                name="credit_history"
                value={formData.credit_history}
                onChange={handleChange}
                required
              >
                <option value="">Select credit history</option>
                <option value="1">Good (1)</option>
                <option value="0">Bad (0)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="property_area">Property Area</label>
              <select
                id="property_area"
                name="property_area"
                value={formData.property_area}
                onChange={handleChange}
                required
              >
                <option value="">Select property area</option>
                <option value="Urban">Urban</option>
                <option value="Semiurban">Semiurban</option>
                <option value="Rural">Rural</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="purpose">Loan Purpose</label>
              <select
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                required
              >
                <option value="">Select purpose</option>
                <option value="Education">Education</option>
                <option value="Home Renovation">Home Renovation</option>
                <option value="Medical Emergency">Medical Emergency</option>
                <option value="Business Expansion">Business Expansion</option>
                <option value="Vehicle Purchase">Vehicle Purchase</option>
                <option value="Personal Use">Personal Use</option>
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              {error && <p className="alert alert-error">{error}</p>}
              {success && <p className="alert alert-success">{success}</p>}
            </div>

            <div className="btn-row" style={{ gridColumn: "1 / -1" }}>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>

        <div className="content-card card-span-4">
          <h3 className="card-title">Before You Submit</h3>

          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Status on Submit</span>
              <span className="info-value">
                <span className="badge badge-pending">Pending</span>
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Credit Score</span>
              <span className="info-value">Generated by backend</span>
            </div>

            <div className="info-item">
              <span className="info-label">Model Input</span>
              <span className="info-value">Dataset aligned</span>
            </div>
          </div>

          <div className="section-space">
            <p className="helper-text">
              Make sure income, loan amount, credit history, and applicant details are accurate before submitting the request.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoanApplicationForm;