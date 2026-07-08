import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoanApplicationForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    amount: "",
    purpose: "",
    monthly_income: ""
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

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Please enter a valid loan amount");
      return;
    }

    if (!formData.monthly_income || Number(formData.monthly_income) <= 0) {
      setError("Please enter a valid monthly income");
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
          Authorization: token
        },
        body: JSON.stringify({
          amount: Number(formData.amount),
          purpose: formData.purpose,
          monthly_income: Number(formData.monthly_income)
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
        amount: "",
        purpose: "",
        monthly_income: ""
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
              <label htmlFor="amount">Loan Amount</label>
              <input
                id="amount"
                type="number"
                name="amount"
                placeholder="Enter requested amount"
                value={formData.amount}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="monthly_income">Monthly Income</label>
              <input
                id="monthly_income"
                type="number"
                name="monthly_income"
                placeholder="Enter monthly income"
                value={formData.monthly_income}
                onChange={handleChange}
                min="1"
                required
              />
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
              <span className="info-label">Review Type</span>
              <span className="info-value">Manual underwriting</span>
            </div>
          </div>

          <div className="section-space">
            <p className="helper-text">
              Make sure the amount and income values are accurate before submitting the request.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoanApplicationForm;