import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { getApiUrl } from '../utils/api';

export default function AuthPage({ isLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = isLogin ? getApiUrl('/api/auth/login') : getApiUrl('/api/auth/signup');
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user, data.token);
        navigate('/');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="w-full max-w-md p-8 rounded-2xl shadow-xl animate-fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-3xl font-bold mb-6 text-center" style={{ fontFamily: 'Syne' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-red-500/10 border border-red-500/20 text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-muted">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl outline-none transition-all focus:ring-2 focus:ring-accent/20"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-muted">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl outline-none transition-all focus:ring-2 focus:ring-accent/20"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-muted">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl outline-none transition-all focus:ring-2 focus:ring-accent/20"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mt-4"
            style={{ background: 'var(--text)', color: 'var(--bg)', fontFamily: 'Syne' }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <p className="mt-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link to={isLogin ? '/signup' : '/login'} className="font-bold underline" style={{ color: 'var(--text)' }}>
            {isLogin ? 'Sign Up' : 'Log In'}
          </Link>
        </p>
      </div>
    </div>
  );
}
