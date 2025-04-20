// frontend/src/components/Column.jsx
import { useDrop } from 'react-dnd';
import TaskCard from './TaskCard'; // Import TaskCard directly

const Column = ({ status, tasks, onDrop, onEdit, onDelete }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'task', // Using the task type directly
    drop: (item) => 
      
      onDrop(item.id, status), // Updating the task status on drop
    
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const filteredTasks = tasks.filter((task) => task.status === status);

  return (
    <div ref={drop} className={`column ${isOver ? 'highlight' : ''}`}>
      <h2>{status}</h2>
      <div className="tasks-list">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default Column;
