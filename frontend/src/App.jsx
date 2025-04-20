// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import KanbanBoard from './components/KanbanBoard';
import TaskForm from './components/TaskForm';
import ProgressChart from './components/ProgressChart';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [socket, setSocket] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('sync:tasks', (initialTasks) => {
      setTasks(initialTasks);
    });

    newSocket.on('task:created', (newTask) => {
      setTasks(prev => [...prev, newTask]);
    });

    newSocket.on('task:updated', (updatedTask) => {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    });

    newSocket.on('task:moved', ({ taskId, newStatus }) => {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    });

    newSocket.on('task:deleted', (taskId) => {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    });

    return () => newSocket.disconnect();
  }, []);

  const handleCreateTask = (task) => {
    socket.emit('task:create', task);
    setShowForm(false);
  };

  const handleUpdateTask = (task) => {
    socket.emit('task:update', task);
    setEditingTask(null);
  };

  const handleMoveTask = (taskId, newStatus) => {
    socket.emit('task:move', { taskId, newStatus });
  };

  const handleDeleteTask = (taskId) => {
    socket.emit('task:delete', taskId);
  };

  return (
    <div className="app">
      <header>
        <h1>Real-Time Kanban Board</h1>
        <button onClick={() => setShowForm(true)}>Add Task</button>
      </header>
      
      <ProgressChart tasks={tasks} />
      
      <KanbanBoard 
        tasks={tasks} 
        onMoveTask={handleMoveTask}
        onEditTask={setEditingTask}
        onDeleteTask={handleDeleteTask}
      />
      
      {(showForm || editingTask) && (
        <TaskForm 
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onClose={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}

export default App;