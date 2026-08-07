import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

function OfficerDashboard() {
  const [pendingLoans, setPendingLoans] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingLoans();
  }, []);

  const fetchPendingLoans = async () => {
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
        setError(data.error || "Failed to load pending loans");
        setLoading(false);
        return;
      }

      setPendingLoans(data);
    } catch (err) {
      setError("Could not connect to backend");
    }

    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getCreditCategory = (score) => {
    if (score >= 80) {
      return { label: "Excellent", className: "badge badge-excellent" };
    }
    if (score >= 70) {
      return { label: "Very Good", className: "badge badge-verygood" };
    }
    if (score >= 60) {
      return { label: "Good", className: "badge badge-good" };
    }
    if (score >= 50) {
      return { label: "Fair", className: "badge badge-fair" };
    }
    return { label: "Poor", className: "badge badge-poor" };
  };

  const creditChartData = [
    {
      name: "Excellent",
      value: pendingLoans.filter((loan) => loan.credit_score >= 80).length
    },
    {
      name: "Very Good",
      value: pendingLoans.filter(
        (loan) => loan.credit_score >= 70 && loan.credit_score < 80
      ).length
      
    },
    {
      name: "Good",
      value: pendingLoans.filter(
        (loan) => loan.credit_score >= 60 && loan.credit_score < 70
      ).length
    },
    {
      name: "Fair",
      value: pendingLoans.filter(
        (loan) => loan.credit_score >= 50 && loan.credit_score < 60
      ).length
    },
    {
      name: "Poor",
      value: pendingLoans.filter((loan) => loan.credit_score < 580).length
    }
  ];

  const COLORS = ["#166534", "#15803d", "#2563eb", "#d97706", "#dc2626"];

  const totalPending = pendingLoans.length;
  const avgScore =
    pendingLoans.length > 0
      ? Math.round(
          pendingLoans.reduce((sum, loan) => sum + loan.credit_score, 0) /
            pendingLoans.length
        )
      : 0;

  return (
    <div className="page-wrap">
      <div className="top-bar">
        <div className="top-bar-left">
          <h2>Officer Dashboard</h2>
          <p>Welcome, {localStorage.getItem("full_name")}</p>
        </div>

        <div className="btn-row">
          <button className="btn-secondary" onClick={fetchPendingLoans}>
            Refresh
          </button>
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {error && <p className="alert alert-error">{error}</p>}

      <div className="stats-grid section-space">
        <div className="stat-card">
          <p className="stat-label">Pending Applications</p>
          <p className="stat-value">{totalPending}</p>
        </div>

        <div className="stat-card">
          <p className="stat-label">Average Credit Score</p>
          <p className="stat-value">{avgScore}</p>
        </div>

        <div className="stat-card">
          <p className="stat-label">Excellent + Very Good</p>
          <p className="stat-value">
            {pendingLoans.filter((loan) => loan.credit_score >= 740).length}
          </p>
        </div>
      </div>

      <div className="dashboard-grid section-space">
        <div className="content-card card-span-4">
          <h3 className="card-title">Credit Score Split</h3>

          <div className="chart-box">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={creditChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {creditChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="content-card card-span-8">
          <div className="card-header">
            <div>
              <h3 className="card-title">Pending Loan Queue</h3>
              <p className="section-subtitle">
                Review all customer applications awaiting underwriting
              </p>
            </div>
          </div>

          {loading ? (
            <div className="loading-box">Loading pending applications...</div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User ID</th>
                    <th>Amount</th>
                    <th>Purpose</th>
                    <th>Monthly Income</th>
                    <th>Credit Score</th>
                    <th>Category</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingLoans.length > 0 ? (
                    pendingLoans.map((loan) => {
                      const creditCategory = getCreditCategory(loan.credit_score);

                      return (
                        <tr key={loan.id}>
                          <td>{loan.id}</td>
                          <td>{loan.user_id}</td>
                          <td>{loan.amount}</td>
                          <td>{loan.purpose}</td>
                          <td>{loan.monthly_income}</td>
                          <td>{loan.credit_score}</td>
                          <td>
                            <span className={creditCategory.className}>
                              {creditCategory.label}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              <button
                                className="btn-primary"
                                onClick={() => navigate(`/underwrite/${loan.id}`)}
                              >
                                Review
                              </button>

                              <button
                                className="btn-secondary"
                                onClick={() => navigate(`/ai-review/${loan.id}`)}
                              >
                                AI Review
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="empty-state">
                        No pending applications
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OfficerDashboard;