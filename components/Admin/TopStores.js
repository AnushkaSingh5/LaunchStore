'use client';

export default function TopStores({ stores = [] }) {
  const topStores = [...stores]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="top-stores-card">
      <div className="card-header">
        <div className="header-title-wrapper">
          <h3>Top Performing Stores</h3>
          <p className="card-subtitle mobile-only-text">Stores ranked by total revenue</p>
        </div>
        <button className="view-all">
          <span>View All</span>
          <svg className="mobile-only-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      {/* Desktop view: Table */}
      <div className="table-wrapper desktop-only-view">
        <table>
          <thead>
            <tr>
              <th>Store</th>
              <th>Revenue</th>
              <th className="hide-constrained">Orders</th>
              <th>Growth</th>
            </tr>
          </thead>
          <tbody>
            {topStores.map(store => (
              <tr key={store.id}>
                <td>
                  <div className="store-cell">
                    <div className="avatar">{store.name.charAt(0)}</div>
                    <span>{store.name}</span>
                  </div>
                </td>
                <td className="revenue">₹{(store.revenue || 0).toLocaleString()}</td>
                <td className="hide-constrained">{store.ordersCount}</td>
                <td>
                  <span className={`growth ${store.growth >= 0 ? 'up' : 'down'}`}>
                    {store.growth >= 0 ? '+' : ''}{store.growth}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view: List card layout */}
      <div className="mobile-only-view mobile-list">
        <div className="mobile-list-header">
          <span>STORE</span>
          <span>REVENUE</span>
        </div>
        <div className="mobile-stores-items">
          {topStores.map(store => {
            // Get avatar color based on name initial or store ID
            const getAvatarColors = (name) => {
              const colors = [
                { bg: '#f3e8ff', text: '#7c3aed' }, // purple (Raceré)
                { bg: '#fdf2f8', text: '#db2777' }, // pink (1store)
                { bg: '#fff7ed', text: '#ea580c' }, // orange (Suyash)
                { bg: '#eff6ff', text: '#2563eb' }, // blue (Shubham)
                { bg: '#f0fdf4', text: '#16a34a' }  // green (2store)
              ];
              let sum = 0;
              for (let i = 0; i < name.length; i++) {
                sum += name.charCodeAt(i);
              }
              return colors[sum % colors.length];
            };
            const avColors = getAvatarColors(store.name);
            
            return (
              <div key={store.id} className="mobile-store-row-card">
                <div className="left-info">
                  <div className="mobile-avatar" style={{ backgroundColor: avColors.bg, color: avColors.text }}>
                    {store.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="mobile-store-name">{store.name}</span>
                </div>
                <div className="right-stats">
                  <span className="mobile-store-revenue">₹{(store.revenue || 0).toLocaleString()}</span>
                  <span className={`mobile-growth-badge ${store.growth >= 0 ? 'up' : 'down'}`}>
                    {store.growth >= 0 ? '+' : ''}{store.growth}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .top-stores-card {
          background: #fff;
          border-radius: 24px;
          padding: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          height: 100%;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        .card-header h3 {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }
        .card-subtitle {
          font-size: 13px;
          color: #94a3b8;
          margin: 4px 0 0 0;
          font-weight: 550;
        }
        .view-all {
          font-size: 11px;
          font-weight: 700;
          color: #8b5cf6;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 0;
        }
        .table-wrapper {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        th {
          font-size: 11px;
          text-transform: uppercase;
          color: #94a3b8;
          font-weight: 700;
          padding: 0 8px 16px 8px;
          border-bottom: 1px solid #f1f5f9;
        }
        th:first-child {
          padding-left: 0;
        }
        th:last-child {
          padding-right: 0;
        }
        td {
          padding: 15px 8px;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          border-bottom: 1px solid #f8fafc;
        }
        td:first-child {
          padding-left: 0;
        }
        td:last-child {
          padding-right: 0;
        }
        .store-cell {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .store-cell span {
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          max-width: 180px;
        }
        .avatar {
          width: 28px;
          height: 28px;
          background: #f1f5f9;
          color: #1e293b;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
        }
        .revenue {
          font-weight: 700;
          color: #1e293b;
        }
        .growth {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 6px;
        }
        .growth.up { background: #dcfce7; color: #166534; }
        .growth.down { background: #fee2e2; color: #b91c1c; }

        /* Mobile views switches */
        .desktop-only-view {
          display: block;
        }
        .mobile-only-view {
          display: none;
        }
        .mobile-only-text {
          display: none;
        }

        @media (max-width: 1400px) {
          .hide-constrained {
            display: none !important;
          }
        }

        @media (max-width: 576px) {
          .desktop-only-view {
            display: none !important;
          }
          .mobile-only-view {
            display: block !important;
          }
          .mobile-only-text {
            display: block !important;
          }
          .mobile-list-header {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            font-weight: 700;
            color: #94a3b8;
            letter-spacing: 0.8px;
            padding: 8px 4px 16px 4px;
            text-transform: uppercase;
          }
          .mobile-stores-items {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .mobile-store-row-card {
            background: #ffffff;
            border: 1px solid #f1f5f9;
            border-radius: 16px;
            padding: 12px 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.01);
          }
          .left-info {
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 0;
          }
          .mobile-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: 700;
            flex-shrink: 0;
          }
          .mobile-store-name {
            font-size: 14px;
            font-weight: 700;
            color: #1e293b;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            max-width: 140px;
          }
          .right-stats {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 4px;
            flex-shrink: 0;
          }
          .mobile-store-revenue {
            font-size: 14px;
            font-weight: 800;
            color: #1e293b;
          }
          .mobile-growth-badge {
            font-size: 10px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 6px;
          }
          .mobile-growth-badge.up {
            background: #dcfce7;
            color: #166534;
          }
          .mobile-growth-badge.down {
            background: #fee2e2;
            color: #b91c1c;
          }
        }
      `}</style>
    </div>
  );
}
