// frontend/src/tests/integration/KanbanBoard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { describe, it, expect, vi } from 'vitest';
import KanbanBoard from '../../components/KanbanBoard';

describe('KanbanBoard', () => {
  const mockTasks = [
    { id: '1', title: 'Task 1', status: 'To Do' },
    { id: '2', title: 'Task 2', status: 'In Progress' },
    { id: '3', title: 'Task 3', status: 'Done' }
  ];

  it('renders columns with correct tasks', () => {
    const mockMove = vi.fn();
    
    render(
      <DndProvider backend={HTML5Backend}>
        <KanbanBoard tasks={mockTasks} onMoveTask={mockMove} />
      </DndProvider>
    );
    
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
    
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });
});