import React, { useState } from 'react';

function Avatar({ user, size = 28 }) {
  const initials = user.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      title={user.name}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: user.color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.36,
        fontWeight: 600,
        fontFamily: 'Syne',
        border: '2px solid var(--surface)',
        flexShrink: 0,
        cursor: 'default'
      }}
    >
      {initials}
    </div>
  );
}

export default function UserPresence({ users, currentUser }) {
  const [open, setOpen] = useState(false);
  const MAX_SHOW = 3;
  const others = users.filter(u => u.id !== currentUser?.id);
  const all = currentUser ? [currentUser, ...others] : others;
  const visible = all.slice(0, MAX_SHOW);
  const overflow = all.length - MAX_SHOW;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center"
        style={{ gap: -4 }}
        title={`${all.length} user${all.length !== 1 ? 's' : ''} online`}
      >
        <div className="flex" style={{ gap: 0 }}>
          {visible.map((u, i) => (
            <div key={u.id} style={{ marginLeft: i === 0 ? 0 : -6, zIndex: visible.length - i }}>
              <Avatar user={u} />
            </div>
          ))}
          {overflow > 0 && (
            <div
              style={{
                marginLeft: -6,
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'var(--surface-2)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 600,
                border: '2px solid var(--surface)',
                zIndex: 0
              }}
            >
              +{overflow}
            </div>
          )}
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-xl z-50 animate-slide-up overflow-hidden"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)', fontFamily: 'Syne' }}>
                {all.length} online
              </p>
            </div>
            <div className="py-1 max-h-64 overflow-y-auto">
              {all.map(u => (
                <div key={u.id} className="flex items-center gap-3 px-3 py-2">
                  <Avatar user={u} size={24} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                      {u.name}
                      {u.id === currentUser?.id && (
                        <span className="ml-1 text-xs" style={{ color: 'var(--text-muted)' }}>(you)</span>
                      )}
                    </p>
                    {u.isTyping && (
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>typing…</p>
                    )}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
