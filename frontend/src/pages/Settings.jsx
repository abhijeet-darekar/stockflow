import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { authFetch } = useAuth();
  const [threshold, setThreshold] = useState(5);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    authFetch('/api/settings')
      .then(r => r.json())
      .then(d => setThreshold(d.defaultLowStockThreshold ?? 5))
      .catch(() => setError('Failed to load settings'));
  }, []);

  const handleSave = async () => {
    setError('');
    const res = await authFetch('/api/settings', {
      method: 'PUT',
      body: JSON.stringify({ defaultLowStockThreshold: threshold }),
    });
    if (!res.ok) { setError('Failed to save'); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Settings</h2>
        <p>Configure your organization defaults</p>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card settings-card">
        <div className="settings-row">
          <div className="settings-info">
            <div className="settings-label">Default low stock threshold</div>
            <div className="settings-desc">
              Products without a custom threshold use this value to trigger low-stock alerts.
            </div>
          </div>
          <input
            type="number"
            className="settings-input"
            value={threshold}
            onChange={e => setThreshold(parseInt(e.target.value) || 0)}
            min="0"
          />
        </div>
        <div className="settings-footer">
          {saved && <span className="save-success">✓ Saved successfully</span>}
          <button className="btn btn-primary" onClick={handleSave}>Save changes</button>
        </div>
      </div>
    </div>
  );
}