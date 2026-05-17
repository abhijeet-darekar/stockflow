import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', organizationName: '' });
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    try {
      const res = await fetch('http://localhost:3001/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, organizationName: form.organizationName }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      login(data.token, data.user);
      navigate('/dashboard');
    } catch {
      setError('Network error. Is the backend running?');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">📦 StockFlow</div>
        <p className="auth-sub">Create your account</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Organization name</label>
            <input value={form.organizationName} onChange={set('organizationName')} type="text" placeholder="My Store" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input value={form.email} onChange={set('email')} type="email" placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input value={form.password} onChange={set('password')} type="password" placeholder="Min 6 characters" required />
          </div>
          <div className="form-group">
            <label>Confirm password</label>
            <input value={form.confirmPassword} onChange={set('confirmPassword')} type="password" placeholder="••••••" required />
          </div>
          <button type="submit" className="btn btn-primary btn-full">Create account</button>
        </form>
        <p className="auth-switch">Have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}