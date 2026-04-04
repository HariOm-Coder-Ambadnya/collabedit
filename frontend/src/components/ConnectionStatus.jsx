import React from 'react';

export default function ConnectionStatus({ connected }) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
      style={{
        background: 'var(--surface-2)',
        color: connected ? '#22c55e' : '#ef4444',
        border: '1px solid var(--border)'
      }}
      title={connected ? 'Connected to server' : 'Disconnected — trying to reconnect…'}
    >
      <div
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: connected ? '#22c55e' : '#ef4444',
          animation: connected ? 'none' : 'pulseDot 1s ease-in-out infinite'
        }}
      />
      <span className="hidden sm:inline">{connected ? 'Online' : 'Offline'}</span>
    </div>
  );
}
