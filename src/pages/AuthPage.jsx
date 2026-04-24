import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import './AuthPage.css';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError('Name is required'); setLoading(false); return; }
        await signup(form.name, form.email, form.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-grid" />
      </div>

      <div className="auth-container animate-in">
        <div className="auth-brand">
          <div className="auth-logo">
            <CheckSquare size={24} />
          </div>
          <span className="auth-logo-text">TaskFlow</span>
        </div>

        <div className="auth-card card">
          <div className="auth-card-header">
            <h1 className="auth-title">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="auth-subtitle">
              {mode === 'login'
                ? 'Sign in to continue to your workspace'
                : 'Start managing your projects today'}
            </p>
          </div>

          {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Full name</label>
                <div className="input-wrap">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    className="form-input has-icon"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="input-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  className="form-input has-icon"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  className="form-input has-icon"
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
              {loading ? <span className="spinner" /> : <ArrowRight size={16} />}
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="auth-switch">
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <button onClick={() => { setMode('signup'); setError(''); }} className="auth-link">
                  Sign up free
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => { setMode('login'); setError(''); }} className="auth-link">
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

        <div className="auth-features">
          {['Project management', 'Todo tracking', 'Priority levels', 'Clean UI'].map(f => (
            <div key={f} className="auth-feature">
              <Sparkles size={12} />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
