// frontend/src/components/TaskCard.jsx
import { useDrag } from 'react-dnd';

const TaskCard = ({ task, onEdit, onDelete }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'task',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const isImage = (filename) =>
    /\.(jpeg|jpg|png|gif)$/i.test(filename);

  const getFileName = (path) => {
    return path.split('/').pop();
  };

  const getFullURL = (path) => {
    return `http://localhost:5000${path}`;
  };

  return (
    <div
      ref={drag}
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      onClick={() => onEdit(task)}
    >
      <div className="task-header">
        <h3>{task.title}</h3>
        <span className={`priority ${task.priority}`}>{task.priority}</span>
        <button
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
        >
          ×
        </button>
      </div>
      <p>{task.description}</p>

      {task.category && <span className="category">{task.category}</span>}

      {task.attachment && (
        <div className="attachment" style={{ marginTop: '1rem' }}>
          <p> Attachment:</p>
          {isImage(task.attachment) ? (
            <img
              src={getFullURL(task.attachment)}
              alt="Attachment"
              style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '0.5rem' }}
            />
          ) : (
            <a
              href={getFullURL(task.attachment)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#007bff', textDecoration: 'underline' }}
            >
              📄 {getFileName(task.attachment)}
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
