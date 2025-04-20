const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { connect, getDb } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and documents are allowed.'));
  }
};

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
}).single('file');

// File upload endpoint
app.post('/upload', (req, res) => {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // Multer error occurred (like file too large)
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File size too large. Max 5MB allowed.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      // Other errors like invalid file type
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    res.status(200).json({ 
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      message: 'File uploaded successfully!'
    });
  });
});

// WebSocket logic
io.on('connection', async (socket) => {
  console.log('New client connected');
  const db = getDb();
  const tasksCollection = db.collection('tasks');

  try {
    const tasks = await tasksCollection.find().toArray();
    socket.emit('sync:tasks', tasks);

    socket.on('task:create', async (task) => {
      try {
        const newTask = { 
          ...task, 
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await tasksCollection.insertOne(newTask);
        io.emit('task:created', newTask);
      } catch (err) {
        console.error('Error creating task:', err);
        socket.emit('error', 'Failed to create task');
      }
    });

    socket.on('task:update', async (updatedTask) => {
      try {
        const result = await tasksCollection.updateOne(
          { id: updatedTask.id },
          { $set: { ...updatedTask, updatedAt: new Date() } }
        );

        if (result.modifiedCount === 1) {
          const task = await tasksCollection.findOne({ id: updatedTask.id });
          io.emit('task:updated', task);
        }
      } catch (err) {
        console.error('Error updating task:', err);
        socket.emit('error', 'Failed to update task');
      }
    });

    socket.on('task:move', async ({ taskId, newStatus }) => {
      try {
        const result = await tasksCollection.updateOne(
          { id: taskId },
          { $set: { status: newStatus, updatedAt: new Date() } }
        );

        if (result.modifiedCount === 1) {
          io.emit('task:moved', { taskId, newStatus });
        }
      } catch (err) {
        console.error('Error moving task:', err);
        socket.emit('error', 'Failed to move task');
      }
    });

    socket.on('task:delete', async (taskId) => {
      try {
        const result = await tasksCollection.deleteOne({ id: taskId });
        if (result.deletedCount === 1) {
          io.emit('task:deleted', taskId);
        }
      } catch (err) {
        console.error('Error deleting task:', err);
        socket.emit('error', 'Failed to delete task');
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });

  } catch (err) {
    console.error('Database connection error:', err);
    socket.emit('error', 'Database connection error');
  }
});

// Global error handler (fallback)
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
connect().then(() => {
  server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ MongoDB connected`);
  });
}).catch(err => {
  console.error('❌ Failed to connect to MongoDB:', err);
  process.exit(1);
});
