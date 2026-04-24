import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import TodoModal from '../components/TodoModal';
import ProjectModal from '../components/ProjectModal';
import {
  Plus, Pencil, Trash2, ArrowLeft, CheckSquare,
  Calendar, Flag, MoreVertical, Filter, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format, isPast, isToday } from 'date-fns';
import './ProjectDetail.css';

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todoModal, setTodoModal] = useState(null);
  const [editProject, setEditProject] = useState(false);
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  const [deleteTodoId, setDeleteTodoId] = useState(null);
  const [filter, setFilter] = useState('all'); // all | active | done
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pRes, tRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/todos/project/${id}`)
        ]);
        setProject(pRes.data);
        setTodos(tRes.data);
      } catch {
        toast.error('Project not found');
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  useEffect(() => {
    const handler = () => setOpenMenu(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleSaveTodo = async (form) => {
    if (todoModal && todoModal._id) {
      const { data } = await api.put(`/todos/${todoModal._id}`, form);
      setTodos(ts => ts.map(t => t._id === todoModal._id ? data : t));
      toast.success('Todo updated');
    } else {
      const { data } = await api.post('/todos', form);
      setTodos(ts => [data, ...ts]);
      toast.success('Todo added');
    }
    // Refresh project counts
    const { data } = await api.get(`/projects/${id}`);
    setProject(data);
  };

  const handleToggle = async (todo) => {
    try {
      const { data } = await api.put(`/todos/${todo._id}`, { completed: !todo.completed });
      setTodos(ts => ts.map(t => t._id === todo._id ? data : t));
      const { data: p } = await api.get(`/projects/${id}`);
      setProject(p);
    } catch { toast.error('Failed to update'); }
  };

  const handleDeleteTodo = async () => {
    try {
      await api.delete(`/todos/${deleteTodoId}`);
      setTodos(ts => ts.filter(t => t._id !== deleteTodoId));
      setDeleteTodoId(null);
      toast.success('Todo deleted');
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
    } catch { toast.error('Failed to delete'); }
  };

  const handleSaveProject = async (form) => {
    const { data } = await api.put(`/projects/${id}`, form);
    setProject(data);
    toast.success('Project updated');
  };

  const handleDeleteProject = async () => {
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      navigate('/projects');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = todos
    .filter(t => {
      if (filter === 'active') return !t.completed;
      if (filter === 'done') return t.completed;
      return true;
    })
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    });

  const doneCount = todos.filter(t => t.completed).length;
  const progress = todos.length > 0 ? Math.round((doneCount / todos.length) * 100) : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="skeleton" style={{ height: 28, width: '40%' }} />
        <div className="skeleton" style={{ height: 6, width: '100%' }} />
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 64 }} />)}
      </div>
    );
  }

  return (
    <div className="project-detail animate-in">
      {/* Back nav */}
      <Link to="/projects" className="back-link">
        <ArrowLeft size={16} /> All Projects
      </Link>

      {/* Project header */}
      <div className="detail-header">
        <div className="detail-header-left">
          <div className="detail-dot" style={{ background: project.color }} />
          <div>
            <h1 className="detail-title">{project.name}</h1>
            {project.description && <p className="detail-desc">{project.description}</p>}
          </div>
        </div>
        <div className="detail-actions" onClick={e => e.stopPropagation()}>
          <button className="btn btn-ghost btn-icon tooltip" data-tip="Edit project" onClick={() => setEditProject(true)}>
            <Pencil size={16} />
          </button>
          <button className="btn btn-ghost btn-icon tooltip" data-tip="Delete project" onClick={() => setDeleteProjectOpen(true)}>
            <Trash2 size={16} style={{ color: 'var(--red)' }} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="detail-progress card">
        <div className="dp-stats">
          <div className="dp-stat">
            <span className="dp-stat-value">{todos.length}</span>
            <span className="dp-stat-label">Total</span>
          </div>
          <div className="dp-divider" />
          <div className="dp-stat">
            <span className="dp-stat-value" style={{ color: 'var(--accent)' }}>{todos.length - doneCount}</span>
            <span className="dp-stat-label">Active</span>
          </div>
          <div className="dp-divider" />
          <div className="dp-stat">
            <span className="dp-stat-value" style={{ color: 'var(--green)' }}>{doneCount}</span>
            <span className="dp-stat-label">Done</span>
          </div>
          <div className="dp-divider" />
          <div className="dp-stat">
            <span className="dp-stat-value">{progress}%</span>
            <span className="dp-stat-label">Progress</span>
          </div>
        </div>
        <div className="dp-bar">
          <div className="dp-fill" style={{ width: `${progress}%`, background: project.color }} />
        </div>
      </div>

      {/* Todos toolbar */}
      <div className="todos-toolbar">
        <div className="filter-tabs">
          {['all', 'active', 'done'].map(f => (
            <button
              key={f} className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="filter-count">
                {f === 'all' ? todos.length : f === 'active' ? todos.length - doneCount : doneCount}
              </span>
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setTodoModal('new')}>
          <Plus size={14} /> Add Todo
        </button>
      </div>

      {/* Todos list */}
      {filtered.length === 0 ? (
        <div className="empty-state card">
          <CheckSquare size={40} />
          <h3>{filter === 'done' ? 'No completed todos' : filter === 'active' ? 'All done!' : 'No todos yet'}</h3>
          <p>
            {filter === 'all'
              ? 'Add your first todo to start tracking work in this project.'
              : filter === 'active'
              ? 'You have completed all tasks. Great work!'
              : 'Complete some todos to see them here.'}
          </p>
          {filter === 'all' && (
            <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => setTodoModal('new')}>
              <Plus size={14} /> Add todo
            </button>
          )}
        </div>
      ) : (
        <div className="todos-list">
          {filtered.map((todo, i) => {
            const overdue = todo.dueDate && !todo.completed && isPast(new Date(todo.dueDate)) && !isToday(new Date(todo.dueDate));
            const dueToday = todo.dueDate && isToday(new Date(todo.dueDate));

            return (
              <div
                key={todo._id}
                className={`todo-item card animate-in ${todo.completed ? 'completed' : ''}`}
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <button
                  className={`todo-check ${todo.completed ? 'checked' : ''}`}
                  onClick={() => handleToggle(todo)}
                  style={todo.completed ? { background: project.color, borderColor: project.color } : {}}
                >
                  {todo.completed && <Check size={11} color="#fff" />}
                </button>

                <div className="todo-body" onClick={() => setTodoModal(todo)}>
                  <div className="todo-top">
                    <span className="todo-title">{todo.title}</span>
                    <div className="todo-badges">
                      <span className={`badge badge-${todo.priority}`}>
                        <Flag size={9} style={{ marginRight: 3 }} />
                        {todo.priority}
                      </span>
                    </div>
                  </div>
                  {todo.description && <p className="todo-desc">{todo.description}</p>}
                  {todo.dueDate && (
                    <span className={`todo-due ${overdue ? 'overdue' : dueToday ? 'today' : ''}`}>
                      <Calendar size={11} />
                      {overdue ? 'Overdue · ' : dueToday ? 'Today · ' : ''}
                      {format(new Date(todo.dueDate), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>

                <div className="todo-actions" onClick={e => e.stopPropagation()}>
                  <button
                    className="btn btn-ghost btn-icon todo-menu-btn"
                    onClick={() => setOpenMenu(openMenu === todo._id ? null : todo._id)}
                  >
                    <MoreVertical size={15} />
                  </button>
                  {openMenu === todo._id && (
                    <div className="dropdown scale-in" style={{ right: 0 }}>
                      <button className="dropdown-item" onClick={() => { setTodoModal(todo); setOpenMenu(null); }}>
                        <Pencil size={13} /> Edit
                      </button>
                      <button className="dropdown-item danger" onClick={() => { setDeleteTodoId(todo._id); setOpenMenu(null); }}>
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {todoModal && (
        <TodoModal
          todo={todoModal === 'new' ? null : todoModal}
          projectId={id}
          onSave={handleSaveTodo}
          onClose={() => setTodoModal(null)}
        />
      )}

      {editProject && (
        <ProjectModal
          project={project}
          onSave={handleSaveProject}
          onClose={() => setEditProject(false)}
        />
      )}

      {deleteProjectOpen && (
        <div className="modal-overlay" onClick={() => setDeleteProjectOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h2 className="modal-title">Delete "{project.name}"?</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              This will permanently delete this project and all {todos.length} todo{todos.length !== 1 ? 's' : ''}. This action cannot be undone.
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteProjectOpen(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteProject}>Delete project</button>
            </div>
          </div>
        </div>
      )}

      {deleteTodoId && (
        <div className="modal-overlay" onClick={() => setDeleteTodoId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <h2 className="modal-title">Delete todo?</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>This todo will be permanently deleted.</p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteTodoId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteTodo}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
