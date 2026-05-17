import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { authFetch, user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    authFetch('/api/dashboard')
      .then(r => r.json())
      .then(setData)
      .catch(() => setError('Failed to load dashboard'));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Welcome back, <strong>{user?.organizationName}</strong></p>
      </div>
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Total products</div>
          <div className="metric-value">{data.totalProducts}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Units in stock</div>
          <div className="metric-value">{data.totalQuantity}</div>
        </div>
        <div className="metric-card metric-danger">
          <div className="metric-label">Low stock alerts</div>
          <div className="metric-value">{data.lowStockCount}</div>
        </div>
      </div>
      <div className="card">
        <h3>⚠ Low stock items</h3>
        {data.lowStockItems.length === 0 ? (
          <div className="empty-state">✓ All items are well stocked</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Threshold</th>
              </tr>
            </thead>
            <tbody>
              {data.lowStockItems.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td><code>{item.sku}</code></td>
                  <td><span className="badge badge-danger">{item.quantityOnHand}</span></td>
                  <td>{item.threshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}