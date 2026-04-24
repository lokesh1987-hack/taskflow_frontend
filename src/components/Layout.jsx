import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CheckSquare, FolderOpen, Home, LogOut,
  Menu, X, ChevronRight, User
} from 'lucide-react';
import './Layout.css';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-inner">
          {/* Brand */}
          <div className="sidebar-brand">
            <div className="brand-icon">
              <CheckSquare size={18} />
            </div>
            <span className="brand-name">TaskFlow</span>
            <button className="btn btn-ghost sidebar-close" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Nav */}
          <nav className="sidebar-nav">
            <p className="nav-section-label">Navigation</p>
            <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}>
              <Home size={16} />
              <span>Dashboard</span>
              <ChevronRight size={14} className="nav-arrow" />
            </NavLink>
            <NavLink to="/projects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}>
              <FolderOpen size={16} />
              <span>Projects</span>
              <ChevronRight size={14} className="nav-arrow" />
            </NavLink>
          </nav>

          {/* User */}
          <div className="sidebar-footer">
            <div className="sidebar-user">
              <div className="user-avatar">
                {user?.name?.[0]?.toUpperCase() || <User size={14} />}
              </div>
              <div className="user-info">
                <p className="user-name">{user?.name}</p>
                <p className="user-email">{user?.email}</p>
              </div>
            </div>
            <button className="btn btn-ghost logout-btn" onClick={handleLogout} title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="layout-main">
        {/* Topbar */}
        <header className="topbar">
          <button className="btn btn-ghost hamburger" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="topbar-right">
            <div className="topbar-user">
              <div className="user-avatar sm">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
}
