import React from 'react';
import renderer from 'react-test-renderer';

import { TaskCard } from './TaskCard';
import { ThemeProvider } from '../theme';

const task = {
  id: '1',
  title: 'Write report',
  description: 'Finish the quarterly draft',
  completed: false,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  source: 'manual' as const,
};

describe('TaskCard', () => {
  it('renders the title and description', () => {
    let tree: renderer.ReactTestRenderer;
    renderer.act(() => {
      tree = renderer.create(
        <ThemeProvider>
          <TaskCard task={task} onPress={jest.fn()} onToggle={jest.fn()} onDelete={jest.fn()} />
        </ThemeProvider>,
      );
    });

    expect(tree!.root.findByProps({ children: 'Write report' })).toBeTruthy();
    expect(tree!.root.findByProps({ children: 'Finish the quarterly draft' })).toBeTruthy();
  });

  it('calls the toggle handler when the checkbox is pressed', () => {
    const onToggle = jest.fn();
    let tree: renderer.ReactTestRenderer;
    renderer.act(() => {
      tree = renderer.create(
        <ThemeProvider>
          <TaskCard task={task} onPress={jest.fn()} onToggle={onToggle} onDelete={jest.fn()} />
        </ThemeProvider>,
      );
    });

    const checkbox = tree!.root.findByProps({ accessibilityRole: 'checkbox' });
    renderer.act(() => {
      checkbox.props.onPress({ stopPropagation: jest.fn() });
    });

    expect(onToggle).toHaveBeenCalledWith('1');
  });
});
