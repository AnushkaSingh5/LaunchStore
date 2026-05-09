'use client';

export default function TopStores({ stores = [] }) {
  const topStores = [...stores]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="top-stores-card">
      <div className="card-header">
        <h3>Top Performing Stores</h3>
        <button className="view-all">View All</button>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Store</th>
              <th>Revenue</th>
              <th>Orders</th>
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
                <td className="revenue">${(store.revenue || 0).toLocaleString()}</td>
                <td>{store.ordersCount}</td>
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

      <style jsx>{`
        .top-stores-card {
          background: #fff;
          border-radius: 24px;
          padding: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .card-header h3 {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }
        .view-all {
          font-size: 11px;
          font-weight: 700;
          color: #8b5cf6;
          background: none;
          border: none;
          cursor: pointer;
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
          padding-bottom: 16px;
          border-bottom: 1px solid #f1f5f9;
        }
        td {
          padding: 12px 0;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          border-bottom: 1px solid #f8fafc;
        }
        .store-cell {
          display: flex;
          align-items: center;
          gap: 10px;
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
      `}</style>
    </div>
  );
}
