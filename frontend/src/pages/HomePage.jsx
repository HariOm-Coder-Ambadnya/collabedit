import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { getApiUrl } from '../utils/api';

function MoonIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="5" />
      <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

export default function HomePage({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [joinId, setJoinId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createDocument = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(getApiUrl('/api/document'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Document' })
      });
      if (!res.ok) throw new Error('Failed to create document');
      const data = await res.json();
      navigate(`/doc/${data.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const joinDocument = (e) => {
    e.preventDefault();
    const id = joinId.trim();
    if (!id) return;
    // Support full URLs or just IDs
    const docId = id.includes('/doc/') ? id.split('/doc/')[1] : id;
    navigate(`/doc/${docId}`);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--text)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--bg)', fontFamily: 'Syne' }}>CE</span>
          </div>
          <span className="text-lg font-semibold" style={{ fontFamily: 'Syne' }}>CollabEdit</span>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3 bg-surface-2 px-3 py-1.5 rounded-xl border border-border">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: user.color, color: 'white' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium">{user.name}</span>
              <button 
                onClick={logout}
                className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors ml-2"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-semibold px-4 py-2 hover:opacity-70 transition-opacity">Login</Link>
              <Link 
                to="/signup" 
                className="text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:opacity-90"
                style={{ background: 'var(--text)', color: 'var(--bg)' }}
              >
                Sign Up
              </Link>
            </div>
          )}
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg transition-colors"
            style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
            title="Toggle dark mode"
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-lg animate-slide-up">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Real-time collaboration powered by Yjs CRDT
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold text-center mb-4 leading-tight" style={{ fontFamily: 'Syne' }}>
            Write together,<br />
            <span style={{ color: 'var(--text-muted)' }}>in real time.</span>
          </h1>
          <p className="text-center mb-12 text-base" style={{ color: 'var(--text-muted)' }}>
            Create a document and share the link. Anyone with it can join and edit simultaneously — no conflicts, no friction.
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            <button
              onClick={createDocument}
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-base transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
              style={{ background: 'var(--text)', color: 'var(--bg)', fontFamily: 'Syne' }}
            >
              {loading ? 'Creating...' : '+ New Document'}
            </button>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or join existing</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>

            <form onSubmit={joinDocument} className="flex gap-2">
              <input
                type="text"
                value={joinId}
                onChange={e => setJoinId(e.target.value)}
                placeholder="Paste document ID or URL..."
                className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)'
                }}
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl font-medium text-sm transition-all hover:opacity-80"
                style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}
              >
                Join
              </button>
            </form>

            {error && (
              <p className="text-center text-sm text-red-500 animate-fade-in">{error}</p>
            )}
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-16 max-w-lg">
          {['CRDT Sync', 'Live Cursors', 'User Presence', 'Auto-Save', 'Version History', 'Dark Mode'].map(f => (
            <span key={f} className="px-3 py-1 rounded-full text-xs" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              {f}
            </span>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-xs" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
        Built with Yjs · TipTap · Socket.IO · MongoDB
      </footer>
    </div>
  );
}
