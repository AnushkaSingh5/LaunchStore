'use client';

export default function PageLoader() {
  return (
    <div className="page-loader">
      <div className="spinner"></div>
      <p>Loading...</p>
      <style jsx>{`
        .page-loader {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 16px;
          background: #f8fafc;
          font-family: 'Outfit', sans-serif;
        }

        .spinner {
          width: 42px;
          height: 42px;
          border: 4px solid #e5e5e5;
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        p {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
