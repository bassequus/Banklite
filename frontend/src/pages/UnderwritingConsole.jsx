import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function UnderwritingConsole() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loan, setLoan] = useState(null);
  const [comments, setComments] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchLoanDetails();
  }, []);

  const fetchLoanDetails = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://127.0.0.1:5000/api/v1/loans/pending", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to fetch loan details");
        setLoading(false);
        return;
      }

      const selectedLoan = data.find((item) => String(item.id) === String(id));

      if (!selectedLoan) {
        setError("Loan application not found");
        setLoading(false);
        return;
      }

      setLoan(selectedLoan);
    } catch (err) {
      setError("Could not connect to backend");
    }

    setLoading(false);
  };

  const handleAction = async (actionType) => {
    setError("");
    setSuccess("");

    if (!comments.trim()) {
      setError("Comments are required before submitting a decision");
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`http://127.0.0.1:5000/api/v1/loans/${id}/action`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: actionType,
          comments: comments
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to process underwriting decision");
        setActionLoading(false);
        return;
      }

      setSuccess(`Loan application ${actionType} successfully`);

      setTimeout(() => {
        navigate("/officer");
      }, 1200);
    } catch (err) {
      setError("Could not connect to backend");
    }

    setActionLoading(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getCreditCategory = (score) => {
    if (score >= 80) {
      return <span className="badge badge-excellent">Excellent</span>;
    }
    if (score >= 70) {
      return <span className="badge badge-verygood">Very Good</span>;
    }
    if (score >= 60) {
      return <span className="badge badge-good">Good</span>;
    }
    if (score >= 50) {
      return <span className="badge badge-fair">Fair</span>;
    }
    return <span className="badge badge-poor">Poor</span>;
  };

  if (loading) {
    return (
      <div className="page-wrap">
        <div className="top-bar">
          <div className="top-bar-left">
            <h2>Underwriting Console</h2>
            <p>Loading application details...</p>
          </div>

          <div className="btn-row">
            <button className="btn-secondary" onClick={() => navigate("/officer")}>
              Back
            </button>
            <button className="btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="loading-box">Fetching loan application data...</div>
      </div>
    );
  }

  if (error && !loan) {
    return (
      <div className="page-wrap">
        <div className="top-bar">
          <div className="top-bar-left">
            <h2>Underwriting Console</h2>
            <p>Unable to load the requested application</p>
          </div>

          <div className="btn-row">
            <button className="btn-secondary" onClick={() => navigate("/officer")}>
              Back to Dashboard
            </button>
            <button className="btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="content-card">
          <p className="alert alert-error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <div className="top-bar">
        <div className="top-bar-left">
          <h2>Underwriting Console</h2>
          <p>Review and decide on application #{loan.id}</p>
        </div>

        <div className="btn-row">
          <button className="btn-secondary" onClick={() => navigate("/officer")}>
            Back
          </button>
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="details-card card-span-8">
          <div className="card-header">
            <div>
              <h3 className="card-title">Application Details</h3>
              <p className="section-subtitle">
                Manual underwriting decision for pending loan request
              </p>
            </div>
            {getCreditCategory(loan.credit_score)}
          </div>

          <div className="details-grid">
            <div className="detail-box">
              <h4>Application ID</h4>
              <p>{loan.id}</p>
            </div>

            <div className="detail-box">
              <h4>User ID</h4>
              <p>{loan.user_id}</p>
            </div>

            <div className="detail-box">
              <h4>Loan Amount</h4>
              <p>{loan.amount}</p>
            </div>

            <div className="detail-box">
              <h4>Purpose</h4>
              <p>{loan.purpose}</p>
            </div>

            <div className="detail-box">
              <h4>Monthly Income</h4>
              <p>{loan.monthly_income}</p>
            </div>

            <div className="detail-box">
              <h4>Credit Score</h4>
              <p>{loan.credit_score}</p>
            </div>
          </div>

          <div className="section-space">
            <div className="form-group">
              <label htmlFor="comments">Officer Comments</label>
              <textarea
                id="comments"
                placeholder="Enter underwriting comments and justification"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
          </div>

          <div className="section-space">
            {error && <p className="alert alert-error">{error}</p>}
            {success && <p className="alert alert-success">{success}</p>}
          </div>

          <div className="btn-row section-space">
            <button
              className="btn-success"
              onClick={() => handleAction("approved")}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "Approve"}
            </button>

            <button
              className="btn-danger"
              onClick={() => handleAction("rejected")}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "Reject"}
            </button>
          </div>
        </div>

        <div className="content-card card-span-4">
          <h3 className="card-title">Credit Category Guide</h3>

          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Excellent</span>
              <span className="info-value">80 to 100</span>
            </div>

            <div className="info-item">
              <span className="info-label">Very Good</span>
              <span className="info-value">70 to 79</span>
            </div>

            <div className="info-item">
              <span className="info-label">Good</span>
              <span className="info-value">60 to 69</span>
            </div>

            <div className="info-item">
              <span className="info-label">Fair</span>
              <span className="info-value">50 to 59</span>
            </div>

            <div className="info-item">
              <span className="info-label">Poor</span>
              <span className="info-value">0 to 49</span>
            </div>

            <div className="info-item">
              <span className="info-label">Current Status</span>
              <span className="info-value">
                <span className="badge badge-pending">Pending</span>
              </span>
            </div>
          </div>

          <div className="section-space">
            <p className="helper-text">
              Comments are mandatory so the audit log clearly captures the officer’s decision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnderwritingConsole;