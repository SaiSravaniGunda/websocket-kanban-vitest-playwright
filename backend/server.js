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

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
  
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Only document and image files are allowed!');
    }
  }
});

// WebSocket events with MongoDB
io.on('connection', async (socket) => {
  console.log('New client connected');
  const db = getDb();
  const tasksCollection = db.collection('tasks');
  
  try {
    // Send all tasks to newly connected client
    const tasks = await tasksCollection.find().toArray();
    socket.emit('sync:tasks', tasks);
    
    // Task creation
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
    
    // Task update
    socket.on('task:update', async (updatedTask) => {
      try {
        const result = await tasksCollection.updateOne(
          { id: updatedTask.id },
          { 
            $set: { 
              ...updatedTask,
              updatedAt: new Date() 
            } 
          }
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
    
    // Task movement between columns
    socket.on('task:move', async ({ taskId, newStatus }) => {
      try {
        const result = await tasksCollection.updateOne(
          { id: taskId },
          { 
            $set: { 
              status: newStatus,
              updatedAt: new Date() 
            } 
          }
        );
        
        if (result.modifiedCount === 1) {
          io.emit('task:moved', { taskId, newStatus });
        }
      } catch (err) {
        console.error('Error moving task:', err);
        socket.emit('error', 'Failed to move task');
      }
    });
    
    // Task deletion
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

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded or invalid file type' });
  }
  res.json({ 
    fileUrl: `/uploads/${req.file.filename}`,
    fileName: req.file.originalname
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
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
