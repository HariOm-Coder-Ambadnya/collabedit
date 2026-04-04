import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useSocket } from '../hooks/useSocket.js';
import { useCollaboration } from '../hooks/useCollaboration.js';
import CollabEditor from '../components/CollabEditor.jsx';
import Toolbar from '../components/Toolbar.jsx';
import UserPresence from '../components/UserPresence.jsx';
import RevisionHistory from '../components/RevisionHistory.jsx';
import ConnectionStatus from '../components/ConnectionStatus.jsx';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

function MoonIcon() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>;
}
function SunIcon() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="5" /><path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>;
}
function LinkIcon() {
  return <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2M16 8h2a2 2 0 012 2v8a2 2 0 01-2 2h-8a2 2 0 01-2-2v-2" /></svg>;
}
function HistoryIcon() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function HomeIcon() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
}

export default function EditorPage({ darkMode, setDarkMode }) {
  const { id: docId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const {
    ydoc, users, currentUser, docTitle, lastSaved,
    revisionSaved, updateTitle, saveRevision, sendTyping
  } = useCollaboration({ docId, socket, connected });

  const [editor, setEditor] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  useEffect(() => {
    setTitleInput(docTitle);
    document.title = `${docTitle} – CollabEdit`;
  }, [docTitle]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTitleSubmit = (e) => {
    e.preventDefault();
    const t = titleInput.trim() || 'Untitled Document';
    updateTitle(t);
    setEditingTitle(false);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-2.5 sticky top-0 z-40" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        {/* Left: logo + home */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-70 transition-opacity mr-1" style={{ color: 'var(--text-muted)' }}>
          <HomeIcon />
        </button>

        <div className="w-px h-5" style={{ background: 'var(--border)' }} />

        {/* Title */}
        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex items-center gap-2">
              <input
                autoFocus
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                className="text-sm font-semibold bg-transparent outline-none border-b"
                style={{ borderColor: 'var(--accent)', color: 'var(--text)', fontFamily: 'Syne', minWidth: 200 }}
              />
            </form>
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              className="text-sm font-semibold truncate hover:opacity-70 transition-opacity text-left"
              style={{ fontFamily: 'Syne', color: 'var(--text)' }}
            >
              {docTitle}
            </button>
          )}
          {lastSaved && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {revisionSaved ? '✓ Version saved' : `Saved ${lastSaved.toLocaleTimeString()}`}
            </p>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <ConnectionStatus connected={connected} />

          <UserPresence users={users} currentUser={currentUser} />

          <button
            onClick={() => { saveRevision(); }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
            style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            title="Save revision"
          >
            <HistoryIcon />
            <span className="hidden md:inline">History</span>
          </button>

          <button
            onClick={() => setShowHistory(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
            style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            View revisions
          </button>

          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: copied ? '#22c55e' : 'var(--text)',
              color: copied ? '#fff' : 'var(--bg)'
            }}
          >
            <LinkIcon />
            {copied ? 'Copied!' : 'Share'}
          </button>

          <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

          {user ? (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border border-border" style={{ background: user.color, color: 'white' }} title={user.name}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <Link to="/login" className="text-xs font-bold px-2 py-1 hover:opacity-70 transition-opacity">Login</Link>
          )}

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg transition-colors"
            style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="sticky top-[52px] z-30" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <Toolbar editor={editor} onSaveRevision={saveRevision} />
      </div>

      {/* Editor */}
      <main className="flex-1 overflow-auto">
        <CollabEditor
          docId={docId}
          ydoc={ydoc}
          currentUser={currentUser}
          onEditorReady={setEditor}
          onTyping={sendTyping}
        />
      </main>

      {/* Typing indicator */}
      <TypingIndicator users={users} currentUser={currentUser} />

      {/* Revision history panel */}
      {showHistory && (
        <RevisionHistory
          docId={docId}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}

function TypingIndicator({ users, currentUser }) {
  const typing = users.filter(u => u.isTyping && u.id !== currentUser?.id);
  if (typing.length === 0) return null;
  const names = typing.map(u => u.name).join(', ');
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm shadow-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        <span className="flex gap-0.5">
          {[0,1,2].map(i => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-current" style={{ animationDelay: `${i * 0.15}s`, animation: 'pulseDot 1s ease-in-out infinite' }} />
          ))}
        </span>
        <span>{names} {typing.length === 1 ? 'is' : 'are'} typing…</span>
      </div>
    </div>
  );
}
