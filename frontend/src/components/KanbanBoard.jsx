import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Column from './Column';
import './KanbanBoard.css';

const KanbanBoard = ({ tasks, onMoveTask, onEditTask, onDeleteTask }) => {
  const statuses = ['To Do', 'In Progress', 'Done'];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="kanban-wrapper">
        <div className="kanban-board">
          {statuses.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={tasks}
              onDrop={onMoveTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;
