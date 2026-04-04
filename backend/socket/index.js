const Y = require('yjs');
const Document = require('../models/Document');

// In-memory map: docId -> { ydoc, users: Map<socketId, userInfo>, saveTimer }
const rooms = new Map();

function getOrCreateRoom(docId) {
  if (!rooms.has(docId)) {
    rooms.set(docId, {
      ydoc: new Y.Doc(),
      users: new Map(),
      saveTimer: null,
      lastSaved: null
    });
  }
  return rooms.get(docId);
}

function encodeState(ydoc) {
  return Buffer.from(Y.encodeStateAsUpdate(ydoc));
}

async function persistRoom(docId) {
  const room = rooms.get(docId);
  if (!room) return;
  try {
    const ytext = room.ydoc.getText('content');
    const content = ytext.toString();
    const snapshot = encodeState(room.ydoc);
    await Document.findByIdAndUpdate(
      docId,
      { content, yjsState: snapshot, lastModified: new Date() },
      { upsert: true }
    );
    room.lastSaved = new Date();
  } catch (err) {
    console.error(`[persist] Error saving doc ${docId}:`, err.message);
  }
}

async function saveRevision(docId, savedBy = 'system') {
  const room = rooms.get(docId);
  if (!room) return;
  try {
    const doc = await Document.findById(docId);
    if (!doc) return;
    const ytext = room.ydoc.getText('content');
    const content = ytext.toString();
    const snapshot = encodeState(room.ydoc);
    doc.addRevision(content, snapshot, savedBy, `Auto-save at ${new Date().toLocaleTimeString()}`);
    await doc.save();
  } catch (err) {
    console.error(`[revision] Error saving revision for ${docId}:`, err.message);
  }
}

function scheduleSave(docId) {
  const room = rooms.get(docId);
  if (!room) return;
  if (room.saveTimer) clearTimeout(room.saveTimer);
  room.saveTimer = setTimeout(async () => {
    await persistRoom(docId);
  }, 3000);
}

function broadcastPresence(io, docId, room) {
  const users = Array.from(room.users.values()).map(u => ({
    id: u.id,
    name: u.name,
    color: u.color,
    isTyping: u.isTyping || false
  }));
  io.to(docId).emit('presence-update', { users });
}

module.exports = function setupSocket(io) {
  io.on('connection', socket => {
    console.log(`[socket] connected: ${socket.id}`);
    let currentDocId = null;
    let currentUser = null;

    socket.on('join-document', async ({ docId, user }) => {
      if (!docId || !user) return;
      currentDocId = docId;
      currentUser = {
        id: socket.id,
        name: user.name || 'Anonymous',
        color: user.color || '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0'),
        isTyping: false
      };
      socket.join(docId);
      const room = getOrCreateRoom(docId);
      room.users.set(socket.id, currentUser);

      if (room.users.size === 1) {
        try {
          const dbDoc = await Document.findById(docId);
          if (dbDoc && dbDoc.yjsState && dbDoc.yjsState.length > 0) {
            Y.applyUpdate(room.ydoc, new Uint8Array(dbDoc.yjsState));
          }
        } catch (err) {
          console.error('[join] Error loading Yjs state:', err.message);
        }
      }

      const stateUpdate = Y.encodeStateAsUpdate(room.ydoc);
      socket.emit('yjs-state', { update: Buffer.from(stateUpdate).toString('base64') });
      socket.to(docId).emit('user-join', { user: currentUser });
      broadcastPresence(io, docId, room);
    });

    socket.on('yjs-update', ({ docId, update }) => {
      if (!docId || !update) return;
      const room = rooms.get(docId);
      if (!room) return;
      const updateBytes = new Uint8Array(Buffer.from(update, 'base64'));
      Y.applyUpdate(room.ydoc, updateBytes);
      socket.to(docId).emit('yjs-update', { update });
      scheduleSave(docId);
    });

    socket.on('cursor-update', ({ docId, cursor }) => {
      if (!docId) return;
      socket.to(docId).emit('cursor-update', { userId: socket.id, cursor, user: currentUser });
    });

    socket.on('typing', ({ docId, isTyping }) => {
      if (!docId || !currentUser) return;
      const room = rooms.get(docId);
      if (!room) return;
      const u = room.users.get(socket.id);
      if (u) u.isTyping = isTyping;
      broadcastPresence(io, docId, room);
    });

    socket.on('save-revision', async ({ docId }) => {
      if (!docId || !currentUser) return;
      await persistRoom(docId);
      await saveRevision(docId, currentUser.name);
      socket.emit('revision-saved', { message: 'Revision saved successfully' });
    });

    socket.on('update-title', async ({ docId, title }) => {
      if (!docId || !title) return;
      try {
        await Document.findByIdAndUpdate(docId, { title });
        io.to(docId).emit('title-updated', { title });
      } catch (err) {
        console.error('[update-title] error:', err.message);
      }
    });

    socket.on('disconnect', async () => {
      if (!currentDocId) return;
      const room = rooms.get(currentDocId);
      if (room) {
        room.users.delete(socket.id);
        io.to(currentDocId).emit('user-leave', { userId: socket.id, user: currentUser });
        broadcastPresence(io, currentDocId, room);
        if (room.users.size === 0) {
          await persistRoom(currentDocId);
          await saveRevision(currentDocId, currentUser?.name || 'system');
          if (room.saveTimer) clearTimeout(room.saveTimer);
          rooms.delete(currentDocId);
        }
      }
    });
  });
};
