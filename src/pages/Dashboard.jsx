import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FolderOpen, CheckSquare, Clock, TrendingUp, ArrowRight, Plus } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects')
      .then(r => setProjects(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalTodos = projects.reduce((s, p) => s + (p.todoCount || 0), 0);
  const totalDone = projects.reduce((s, p) => s + (p.completedCount || 0), 0);
  const overallProgress = totalTodos > 0 ? Math.round((totalDone / totalTodos) * 100) : 0;

  const stats = [
    { label: 'Projects', value: projects.length, icon: FolderOpen, color: '#7c6af7' },
    { label: 'Total Tasks', value: totalTodos, icon: CheckSquare, color: '#60a5fa' },
    { label: 'Completed', value: totalDone, icon: Clock, color: '#4ade80' },
    { label: 'Progress', value: `${overallProgress}%`, icon: TrendingUp, color: '#fbbf24' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="dashboard animate-in">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="dash-subtitle">Here's what's happening with your projects today.</p>
        </div>
        <Link to="/projects/new" className="btn btn-primary">
          <Plus size={16} /> New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={s.label} className="stat-card card animate-in" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="stat-icon" style={{ background: `${s.color}18`, color: s.color }}>
              <s.icon size={20} />
            </div>
            <div className="stat-info">
              <p className="stat-value">{loading ? '—' : s.value}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {!loading && totalTodos > 0 && (
        <div className="progress-section card animate-in">
          <div className="progress-header">
            <span className="progress-title">Overall Completion</span>
            <span className="progress-pct">{overallProgress}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
          </div>
          <p className="progress-sub">{totalDone} of {totalTodos} tasks completed across all projects</p>
        </div>
      )}

      {/* Recent Projects */}
      <div className="recent-section">
        <div className="section-header">
          <h2 className="section-title">Recent Projects</h2>
          <Link to="/projects" className="section-link">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="projects-grid">
            {[1,2,3].map(i => (
              <div key={i} className="card" style={{ padding: 20 }}>
                <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 12, width: '40%' }} />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state card">
            <FolderOpen size={40} />
            <h3>No projects yet</h3>
            <p>Create your first project to get started organizing your work</p>
            <Link to="/projects/new" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
              <Plus size={14} /> Create project
            </Link>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.slice(0, 6).map((p, i) => (
              <Link
                key={p._id} to={`/projects/${p._id}`}
                className="project-card card animate-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="project-card-top">
                  <div className="project-dot" style={{ background: p.color || '#7c6af7' }} />
                  <h3 className="project-name">{p.name}</h3>
                </div>
                {p.description && (
                  <p className="project-desc">{p.description}</p>
                )}
                <div className="project-meta">
                  <span className="meta-tag">
                    <CheckSquare size={12} />
                    {p.todoCount || 0} tasks
                  </span>
                  <span className="meta-tag done">
                    {p.completedCount || 0} done
                  </span>
                </div>
                {(p.todoCount || 0) > 0 && (
                  <div className="mini-progress">
                    <div
                      className="mini-fill"
                      style={{
                        width: `${Math.round(((p.completedCount || 0) / p.todoCount) * 100)}%`,
                        background: p.color || '#7c6af7'
                      }}
                    />
                  </div>
                )}
                <div className="project-arrow"><ArrowRight size={14} /></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
