import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function AIReviewPage() {
  const { loanId } = useParams();
  const navigate = useNavigate();

  const [aiReview, setAiReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAIReview = async () => {
    setLoading(true);
    setError("");
    setAiReview(null);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://127.0.0.1:5000/api/v1/loans/${loanId}/ai-review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to generate AI review");
        setLoading(false);
        return;
      }

      setAiReview(data.ai_review);
    } catch (err) {
      setError("Could not connect to backend");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAIReview();
  }, [loanId]);

  return (
    <div className="page-wrap">
      <div className="top-bar">
        <div className="top-bar-left">
          <h2>AI Review</h2>
          <p>Loan Application ID: {loanId}</p>
        </div>

        <div className="btn-row">
          <button className="btn-secondary" onClick={() => navigate("/officer")}>
            Back to Dashboard
          </button>
          <button className="btn-secondary" onClick={fetchAIReview}>
            Regenerate
          </button>
        </div>
      </div>

      {loading && <div className="loading-box">Generating AI review...</div>}

      {error && <p className="alert alert-error">{error}</p>}

      {aiReview && (
        <div className="dashboard-grid section-space">
          <div className="content-card card-span-6">
            <h3 className="card-title">Prediction Summary</h3>
            <div className="detail-list">
              <p><strong>Prediction:</strong> {aiReview.prediction}</p>
              <p><strong>Confidence:</strong> {aiReview.confidence}%</p>
              <p><strong>Approval Probability:</strong> {aiReview.approval_probability}%</p>
              <p><strong>Rejection Probability:</strong> {aiReview.rejection_probability}%</p>
              <p><strong>Recommendation:</strong> {aiReview.recommendation}</p>
            </div>
          </div>

          <div className="content-card card-span-6">
            <h3 className="card-title">Decision View</h3>
            <div style={{ paddingTop: "12px" }}>
              <p
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color:
                    aiReview.prediction?.toLowerCase() === "approved"
                      ? "#166534"
                      : "#dc2626"
                }}
              >
                {aiReview.prediction}
              </p>

              <div
                style={{
                  marginTop: "16px",
                  background: "#e5e7eb",
                  borderRadius: "999px",
                  height: "14px",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    width: `${aiReview.approval_probability}%`,
                    background: "#2563eb",
                    height: "100%"
                  }}
                />
              </div>

              <p style={{ marginTop: "10px" }}>
                Approval strength: {aiReview.approval_probability}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIReviewPage;