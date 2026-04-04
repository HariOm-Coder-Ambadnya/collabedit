import React, { useEffect, useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

function CloseIcon() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
}

export default function RevisionHistory({ docId, onClose }) {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/document/${docId}/revisions`)
      .then(r => r.json())
      .then(data => {
        setRevisions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [docId]);

  const viewRevision = async (rev) => {
    setSelected(rev.index);
    try {
      const r = await fetch(`${BACKEND_URL}/api/document/${docId}/revisions/${rev.index}`);
      const data = await r.json();
      setPreview(data);
    } catch {
      setPreview(null);
    }
  };

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' +
      date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-lg z-50 flex flex-col animate-slide-up shadow-2xl"
        style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-base font-semibold" style={{ fontFamily: 'Syne', color: 'var(--text)' }}>
            Revision History
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* List */}
          <div className="w-48 flex-shrink-0 overflow-y-auto py-2" style={{ borderRight: '1px solid var(--border)' }}>
            {loading ? (
              <div className="flex items-center justify-center h-20">
                <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--text)' }} />
              </div>
            ) : revisions.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No revisions yet.</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Revisions are saved automatically when users leave or via "Save version".</p>
              </div>
            ) : (
              revisions.map((rev) => (
                <button
                  key={rev.index}
                  onClick={() => viewRevision(rev)}
                  className="w-full text-left px-4 py-3 transition-colors hover:opacity-80"
                  style={{
                    background: selected === rev.index ? 'var(--surface-2)' : 'transparent',
                    borderLeft: selected === rev.index ? '2px solid var(--text)' : '2px solid transparent'
                  }}
                >
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--text)', fontFamily: 'Syne' }}>
                    {rev.label || `Revision ${rev.index + 1}`}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{formatDate(rev.savedAt)}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>by {rev.savedBy}</p>
                </button>
              ))
            )}
          </div>

          {/* Preview */}
          <div className="flex-1 overflow-y-auto p-5">
            {preview ? (
              <div>
                <div className="mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)', fontFamily: 'Syne' }}>
                    {formatDate(preview.savedAt)} · by {preview.savedBy}
                  </p>
                </div>
                <div
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: 'var(--text)', fontFamily: 'DM Sans' }}
                >
                  {preview.content || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Empty document</span>}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Select a revision to preview
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
