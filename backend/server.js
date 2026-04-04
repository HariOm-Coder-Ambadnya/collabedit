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

// CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn('[cors] Origin blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
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
      console.log(`[server] Backend running on port ${PORT}`);
      console.log(`[server] Allowed Origins:`, allowedOrigins);
    });
  })
  .catch(err => {
    console.error('[db] MongoDB connection error:', err.message);
    process.exit(1);
  });