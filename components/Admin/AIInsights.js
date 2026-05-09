'use client';

export default function AIInsights({ insights = [] }) {
  return (
    <div className="ai-insights-card">
      <div className="card-header">
        <div className="header-title">
          <span className="sparkle">✨</span>
          <h3>AI Insights</h3>
        </div>
        <span className="badge">Beta</span>
      </div>
      <div className="insights-content">
        <ul className="insights-list">
          {insights.map((insight, i) => (
            <li key={i}>
              <span className="bullet">•</span>
              {insight}
            </li>
          ))}
        </ul>
        <button className="full-insights">View Full Analysis</button>
      </div>

      <style jsx>{`
        .ai-insights-card {
          background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
          border-radius: 24px;
          padding: 24px;
          border: 1px solid #ddd6fe;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.1);
          position: relative;
          overflow: hidden;
        }
        .ai-insights-card::after {
          content: 'AI';
          position: absolute;
          right: -20px;
          bottom: -20px;
          font-size: 100px;
          font-weight: 900;
          color: #8b5cf6;
          opacity: 0.05;
          pointer-events: none;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .header-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sparkle {
          font-size: 18px;
        }
        .header-title h3 {
          font-size: 16px;
          font-weight: 800;
          color: #4c1d95;
          margin: 0;
        }
        .badge {
          background: #8b5cf6;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 20px;
          text-transform: uppercase;
        }
        .insights-list {
          list-style: none;
          padding: 0;
          margin: 0 0 20px 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .insights-list li {
          font-size: 13px;
          font-weight: 600;
          color: #5b21b6;
          display: flex;
          gap: 8px;
          line-height: 1.4;
        }
        .bullet {
          color: #8b5cf6;
        }
        .full-insights {
          width: 100%;
          padding: 10px;
          background: #fff;
          border: 1px solid #ddd6fe;
          border-radius: 12px;
          color: #7c3aed;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .full-insights:hover {
          background: #fdf2f8;
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(124, 58, 237, 0.1);
        }
      `}</style>
    </div>
  );
}
