require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const documentRoutes = require('./routes/document');
const setupSocket = require('./socket');

const app = express();
const server = http.createServer(app);

// CORS - allow all origins
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS']
};

const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// API Routes
app.use('/api/document', documentRoutes);

// Socket.IO setup
setupSocket(io);

// Connect MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/collabedit';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('[db] MongoDB connected:', MONGODB_URI);
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(`[server] CollabEdit backend running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('[db] MongoDB connection error:', err.message);
    process.exit(1);
  });