import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">📦</span>
        <div>
          <div className="logo-name">StockFlow</div>
          <div className="logo-org">{user?.organizationName}</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <span className="nav-icon">📊</span> Dashboard
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <span className="nav-icon">📦</span> Products
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <span className="nav-icon">⚙️</span> Settings
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">{user?.email}</div>
        <button className="btn btn-sm logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
}