// Required Libraries:
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { Server } = require('socket.io');
const logger = require('./utills/logger.js');
const path = require('path');

const connectDb = require('./db/db');
const notFound = require('./middlewares/not-found.js');
const authRoute = require('./routes/auth.js');
const chatRoute = require('./routes/chatList.js');
const profileRoute = require('./routes/profile.js');
const chat = require('./routes/chat.js');
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

global.io = io;

io.on('connection', (socket) => {
  logger.info(`⚡ New client connected: ${socket.id}`);

  socket.on('join', (userId) => {
    socket.join(userId);
    logger.info(`👤 User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    logger.info(`❌ Client disconnected: ${socket.id}`);
  });
});



// Used MiddleWares
app.use(bodyParser.json({ limit: '80mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(limiter);
app.use(express.json());

app.use('/api/v1', authRoute);
app.use('/api/v1', chatRoute);
app.use('/api/v1', chat);
app.use('/api/v1', profileRoute);
app.use(notFound);

const serverConnection = async (DB_STRING, PORT) => {
  try {
    await connectDb(DB_STRING).then(() => {
      server.listen(PORT, () => {
        logger.info(`🚀 Server + Socket.io running on http://localhost:${PORT}`);
      });
    });
  } catch (err) {
    logger.error('Database connection failed:', err);
  }
};

serverConnection(process.env.DB_CONNECTION_STRING, process.env.PORT);