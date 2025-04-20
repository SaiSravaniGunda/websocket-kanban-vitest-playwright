// frontend/src/components/KanbanBoard.jsx
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Column from './Column'; // Import the Column component directly
import './KanbanBoard.css';

const KanbanBoard = ({ tasks, onMoveTask, onEditTask, onDeleteTask }) => {
  const statuses = ['To Do', 'In Progress', 'Done'];

  console.log(tasks);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="kanban-board">
        {statuses.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={tasks}
            onDrop={onMoveTask}  // When the task is dropped, update its status
            onEdit={onEditTask}  // Function for editing the task
            onDelete={onDeleteTask}  // Function for deleting the task
          />
        ))}
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;
