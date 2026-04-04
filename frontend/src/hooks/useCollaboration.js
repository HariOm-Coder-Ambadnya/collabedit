import { useEffect, useRef, useState, useCallback } from 'react';
import * as Y from 'yjs';
import * as Y from 'yjs';

const COLORS = [
  '#e53e3e', '#dd6b20', '#d69e2e', '#38a169',
  '#3182ce', '#805ad5', '#d53f8c', '#00b5d8'
];

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function getStoredUser() {
  try {
    const stored = localStorage.getItem('collabedit-user');
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

export function useCollaboration({ docId, socket, connected }) {
  const ydocRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [docTitle, setDocTitle] = useState('Untitled Document');
  const [lastSaved, setLastSaved] = useState(null);
  const [revisionSaved, setRevisionSaved] = useState(false);

  // Init ydoc once
  if (!ydocRef.current) {
    ydocRef.current = new Y.Doc();
  }

  useEffect(() => {
    if (!socket || !connected || !docId) return;

    // Determine or create user identity
    let user = getStoredUser();
    if (!user) {
      user = {
        name: `User-${Math.floor(Math.random() * 9000) + 1000}`,
        color: randomColor()
      };
      localStorage.setItem('collabedit-user', JSON.stringify(user));
    }
    
    setCurrentUser({ ...user, id: socket.id });

    // Join the document room
    socket.emit('join-document', { docId, user });

    // Receive full Yjs state from server
    socket.on('yjs-state', ({ update }) => {
      const bytes = Uint8Array.from(atob(update), c => c.charCodeAt(0));
      Y.applyUpdate(ydocRef.current, bytes);
    });

    // Receive incremental Yjs updates from peers
    socket.on('yjs-update', ({ update }) => {
      const bytes = Uint8Array.from(atob(update), c => c.charCodeAt(0));
      Y.applyUpdate(ydocRef.current, bytes);
    });

    // Presence
    socket.on('presence-update', ({ users }) => {
      setUsers(users);
    });

    socket.on('title-updated', ({ title }) => {
      setDocTitle(title);
    });

    socket.on('revision-saved', () => {
      setRevisionSaved(true);
      setTimeout(() => setRevisionSaved(false), 3000);
    });

    // Observe local changes and broadcast
    const observer = (update, origin) => {
      if (origin !== 'remote') {
        const encoded = btoa(String.fromCharCode(...update));
        socket.emit('yjs-update', { docId, update: encoded });
        setLastSaved(new Date());
      }
    };
    ydocRef.current.on('update', observer);

    return () => {
      socket.off('yjs-state');
      socket.off('yjs-update');
      socket.off('presence-update');
      socket.off('title-updated');
      socket.off('revision-saved');
      ydocRef.current.off('update', observer);
    };
  }, [socket, connected, docId]);

  const updateTitle = useCallback((title) => {
    setDocTitle(title);
    if (socket && docId) {
      socket.emit('update-title', { docId, title });
    }
  }, [socket, docId]);

  const saveRevision = useCallback(() => {
    if (socket && docId) {
      socket.emit('save-revision', { docId });
    }
  }, [socket, docId]);

  const sendCursor = useCallback((cursor) => {
    if (socket && docId) {
      socket.emit('cursor-update', { docId, cursor });
    }
  }, [socket, docId]);

  const sendTyping = useCallback((isTyping) => {
    if (socket && docId) {
      socket.emit('typing', { docId, isTyping });
    }
  }, [socket, docId]);

  return {
    ydoc: ydocRef.current,
    users,
    currentUser,
    docTitle,
    lastSaved,
    revisionSaved,
    updateTitle,
    saveRevision,
    sendCursor,
    sendTyping
  };
}
