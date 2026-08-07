import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CustomerDashboard() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://127.0.0.1:5000/api/v1/loans/my-applications", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load applications");
        setLoading(false);
        return;
      }

      setApplications(data);
    } catch (err) {
      setError("Could not connect to backend");
    }

    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getStatusBadge = (status) => {
    if (status === "approved") {
      return <span className="badge badge-approved">Approved</span>;
    }
    if (status === "rejected") {
      return <span className="badge badge-rejected">Rejected</span>;
    }
    return <span className="badge badge-pending">Pending</span>;
  };

  const pendingCount = applications.filter((app) => app.status === "pending").length;
  const approvedCount = applications.filter((app) => app.status === "approved").length;
  const rejectedCount = applications.filter((app) => app.status === "rejected").length;

  return (
    <div className="page-wrap">
      <div className="top-bar">
        <div className="top-bar-left">
          <h2>Customer Dashboard</h2>
          <p>Welcome, {localStorage.getItem("full_name")}</p>
        </div>

        <div className="btn-row">
          <button className="btn-primary" onClick={() => navigate("/apply")}>
            Apply for New Loan
          </button>
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="stats-grid section-space">
        <div className="stat-card">
          <p className="stat-label">Total Applications</p>
          <h3 className="stat-value">{applications.length}</h3>
        </div>

        <div className="stat-card">
          <p className="stat-label">Pending</p>
          <h3 className="stat-value">{pendingCount}</h3>
        </div>

        <div className="stat-card">
          <p className="stat-label">Approved</p>
          <h3 className="stat-value">{approvedCount}</h3>
        </div>
      </div>

      <div className="content-card section-space">
        <div className="card-header">
          <div>
            <h3 className="card-title">My Loan Applications</h3>
            <p className="section-subtitle">
              Track your submitted loan requests and current decision status
            </p>
          </div>
        </div>

        {loading ? (
          <div className="loading-box">Loading your applications...</div>
        ) : error ? (
          <p className="alert alert-error">{error}</p>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            No loan applications found. Click "Apply for New Loan" to get started.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Purpose</th>
                  <th>Monthly Income</th>
                  <th>Credit Score</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>{app.id}</td>
                    <td>{app.amount}</td>
                    <td>{app.purpose}</td>
                    <td>{app.monthly_income}</td>
                    <td>{app.credit_score}</td>
                    <td>{getStatusBadge(app.status)}</td>
                    <td>{app.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="content-card section-space">
        <h3 className="card-title">Application Summary</h3>

        <div className="info-list">
          <div className="info-item">
            <span className="info-label">Pending Requests</span>
            <span className="info-value">{pendingCount}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Approved Requests</span>
            <span className="info-value">{approvedCount}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Rejected Requests</span>
            <span className="info-value">{rejectedCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;