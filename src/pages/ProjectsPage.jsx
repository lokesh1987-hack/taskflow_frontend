import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ProjectModal from '../components/ProjectModal';
import {
  Plus, FolderOpen, Pencil, Trash2, ArrowRight,
  CheckSquare, MoreVertical, Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import './ProjectsPage.css';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | project obj
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();

  const fetch = () => {
    setLoading(true);
    api.get('/projects')
      .then(r => setProjects(r.data))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  // close menus on outside click
  useEffect(() => {
    const handler = () => setOpenMenu(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleSave = async (form) => {
    if (modal && modal._id) {
      const { data } = await api.put(`/projects/${modal._id}`, form);
      setProjects(ps => ps.map(p => p._id === modal._id ? data : p));
      toast.success('Project updated');
    } else {
      const { data } = await api.post('/projects', form);
      setProjects(ps => [data, ...ps]);
      toast.success('Project created');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/projects/${deleteId}`);
      setProjects(ps => ps.filter(p => p._id !== deleteId));
      setDeleteId(null);
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="projects-page animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-sub">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Search */}
      {projects.length > 0 && (
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input
            className="form-input search-input"
            placeholder="Search projects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="projects-list">
          {[1,2,3,4].map(i => (
            <div key={i} className="card" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 12, height: 12, borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 11, width: '25%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        projects.length === 0 ? (
          <div className="empty-state card">
            <FolderOpen size={44} />
            <h3>No projects yet</h3>
            <p>Create your first project to start tracking todos and managing your work.</p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => setModal('create')}>
              <Plus size={14} /> Create project
            </button>
          </div>
        ) : (
          <div className="empty-state card">
            <Search size={32} />
            <h3>No matches</h3>
            <p>No projects match "{search}"</p>
          </div>
        )
      ) : (
        <div className="projects-list">
          {filtered.map((p, i) => {
            const progress = p.todoCount > 0 ? Math.round((p.completedCount / p.todoCount) * 100) : 0;
            return (
              <div key={p._id} className="project-row card animate-in" style={{ animationDelay: `${i * 0.04}s` }}>
                <div
                  className="project-color-bar"
                  style={{ background: p.color || '#7c6af7' }}
                />
                <div className="project-row-content" onClick={() => navigate(`/projects/${p._id}`)}>
                  <div className="project-row-left">
                    <h3 className="project-row-name">{p.name}</h3>
                    {p.description && <p className="project-row-desc">{p.description}</p>}
                    <div className="project-row-meta">
                      <span className="meta-tag">
                        <CheckSquare size={11} /> {p.todoCount || 0} tasks
                      </span>
                      <span className="meta-tag done">
                        {p.completedCount || 0} done
                      </span>
                      {p.todoCount > 0 && (
                        <span className="meta-tag" style={{ color: p.color }}>
                          {progress}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="project-row-right">
                    {p.todoCount > 0 && (
                      <div className="row-progress">
                        <div className="row-fill" style={{ width: `${progress}%`, background: p.color }} />
                      </div>
                    )}
                    <ArrowRight size={16} className="row-arrow" />
                  </div>
                </div>

                {/* Kebab menu */}
                <div className="row-actions" onClick={e => e.stopPropagation()}>
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => setOpenMenu(openMenu === p._id ? null : p._id)}
                  >
                    <MoreVertical size={16} />
                  </button>
                  {openMenu === p._id && (
                    <div className="dropdown scale-in">
                      <button className="dropdown-item" onClick={() => { setModal(p); setOpenMenu(null); }}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="dropdown-item danger" onClick={() => { setDeleteId(p._id); setOpenMenu(null); }}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project modal */}
      {modal && (
        <ProjectModal
          project={modal === 'create' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Project?</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              This will permanently delete the project and all its todos. This cannot be undone.
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
