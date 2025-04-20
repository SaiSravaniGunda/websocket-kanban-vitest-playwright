// frontend/src/tests/unit/TaskCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TaskCard from '../../components/TaskCard';

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    priority: 'high',
    category: 'bug',
    status: 'To Do',
    attachment: null
  };

  const renderWithDnD = (ui) =>
    render(
      <DndProvider backend={HTML5Backend}>
        {ui}
      </DndProvider>
    );

  it('renders task information correctly', () => {
    renderWithDnD(<TaskCard task={mockTask} />);

    // Title & description
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();

    // Priority & category (case-insensitive)
    expect(screen.getByText(/high/i)).toBeInTheDocument();
    expect(screen.getByText(/bug/i)).toBeInTheDocument();
  });

  it('calls onEdit when clicked', () => {
    const mockEdit = vi.fn();
    renderWithDnD(<TaskCard task={mockTask} onEdit={mockEdit} />);

    fireEvent.click(screen.getByText('Test Task'));
    expect(mockEdit).toHaveBeenCalledWith(mockTask);
  });

  it('calls onDelete when delete button is clicked', () => {
    const mockDelete = vi.fn();
    renderWithDnD(<TaskCard task={mockTask} onDelete={mockDelete} />);

    fireEvent.click(screen.getByRole('button', { name: '×' }));
    expect(mockDelete).toHaveBeenCalledWith('1');
  });
});
