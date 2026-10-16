import React, { useState } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act, cleanup, fireEvent, within } from '@testing-library/react';
import { ProjectsWorkspace } from './ProjectsWorkspace.jsx';
import { lightTheme } from '../../../../data/theme/themeData.js';

const dnd = vi.hoisted(() => ({ props: null, keyboard: null }));
vi.mock('@dnd-kit/core', () => ({
  DndContext: props => { dnd.props = props; return props.children; },
  DragOverlay: ({ children }) => children,
  PointerSensor: 'pointer', KeyboardSensor: 'keyboard',
  useSensor: (sensor, options) => { if (sensor === 'keyboard') dnd.keyboard = options; return {}; },
  useSensors: () => [],
  useDraggable: () => ({ attributes: {}, listeners: {}, setNodeRef: () => {}, setActivatorNodeRef: () => {}, isDragging: false }),
  useDroppable: () => ({ setNodeRef: () => {}, isOver: false }),
  pointerWithin: vi.fn(() => ['pointer']), rectIntersection: vi.fn(() => ['keyboard']),
}));
const project = { id: 1, customerId: 'a', name: 'Office', stage: 'Discovery', value: 1000, notes: 'Keep me' };
function Harness({ onUpdate = vi.fn() }) {
  const [projects, setProjects] = useState([project]);
  return <ProjectsWorkspace theme={lightTheme} view="pipeline" customers={[{ id: 'a', name: 'Acme' }]} opportunities={projects} onOpenProject={vi.fn()} onOpenCustomer={vi.fn()} onUpdateProject={updated => { onUpdate(updated); setProjects([updated]); }} />;
}
const move = (stage, value = project) => act(() => dnd.props.onDragEnd({ active: { data: { current: { project: value } } }, over: stage ? { data: { current: { stage } } } : null }));
afterEach(cleanup);

describe('Active Projects board drag wiring', () => {
  it('moves between sections, preserves project fields and supports undo', () => {
    const onUpdate = vi.fn(); render(<Harness onUpdate={onUpdate} />);
    move('Specifying');
    expect(onUpdate).toHaveBeenLastCalledWith({ ...project, stage: 'Specifying' });
    expect(within(screen.getByRole('region', { name: 'Specifying Active Projects' })).getByText('Office')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Undo stage change' }));
    expect(onUpdate).toHaveBeenLastCalledWith(project);
  });
  it('can close a project through the persistent Won drop target', () => {
    const onUpdate = vi.fn(); render(<Harness onUpdate={onUpdate} />);
    move('Won');
    expect(onUpdate).toHaveBeenCalledWith({ ...project, stage: 'Won' });
    expect(screen.queryByRole('combobox', { name: 'Stage for Office' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Show closed' }));
    expect(within(screen.getByRole('region', { name: 'Won Active Projects' })).getByText('Office')).toBeInTheDocument();
  });
  it('places keyboard focus on Undo when a closed card disappears', () => {
    render(<Harness />);
    act(() => dnd.props.onDragEnd({ active: { data: { current: { project } } }, over: { data: { current: { stage: 'Won' } } }, activatorEvent: { type: 'keydown' } }));
    expect(screen.getByRole('button', { name: 'Undo stage change' })).toHaveFocus();
  });
  it('does not change data on cancellation, same-stage or invalid drops', () => {
    const onUpdate = vi.fn(); render(<Harness onUpdate={onUpdate} />);
    move(null); move('Discovery'); move('Invalid');
    act(() => dnd.props.onDragCancel());
    expect(onUpdate).not.toHaveBeenCalled();
  });
  it('keyboard arrows target the next stage and clamp at the edges', () => {
    render(<Harness />);
    const event = { code: 'ArrowRight', preventDefault: vi.fn() };
    const context = { active: { data: { current: { project } } }, over: null, collisionRect: { width: 100, height: 100 }, droppableContainers: { getEnabled: () => [{ id: 'stage:Discovery' }, { id: 'stage:Specifying' }] }, droppableRects: new Map([['stage:Discovery', { left: 0, top: 0, width: 200, height: 400 }], ['stage:Specifying', { left: 220, top: 0, width: 200, height: 400 }]]) };
    expect(dnd.keyboard.coordinateGetter(event, { context })).toEqual({ x: 270, y: 60 });
    expect(event.preventDefault).toHaveBeenCalled();
    expect(dnd.keyboard.coordinateGetter({ ...event, code: 'ArrowLeft' }, { context })).toEqual({ x: 50, y: 60 });
    expect(dnd.keyboard.coordinateGetter({ ...event, code: 'Escape' }, { context })).toBeUndefined();
  });
});
