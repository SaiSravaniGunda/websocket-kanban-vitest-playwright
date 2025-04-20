// frontend/src/tests/unit/TaskCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskCard from '../../components/TaskCard';

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    priority: 'high',
    category: 'bug',
    status: 'To Do'
  };

  it('renders task information correctly', () => {
    render(<TaskCard task={mockTask} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Bug')).toBeInTheDocument();
  });

  it('calls onEdit when clicked', () => {
    const mockEdit = vi.fn();
    render(<TaskCard task={mockTask} onEdit={mockEdit} />);
    
    fireEvent.click(screen.getByText('Test Task'));
    expect(mockEdit).toHaveBeenCalledWith(mockTask);
  });

  it('calls onDelete when delete button is clicked', () => {
    const mockDelete = vi.fn();
    render(<TaskCard task={mockTask} onDelete={mockDelete} />);
    
    fireEvent.click(screen.getByRole('button', { name: '×' }));
    expect(mockDelete).toHaveBeenCalledWith('1');
  });
});