import React, { useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, KeyboardSensor, useSensor, useSensors, useDraggable, useDroppable, pointerWithin, rectIntersection } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import { STAGES } from '../../data.js';
import { fmtCurrency } from './utils.js';
import { projectListValue } from './workspaceData.js';

const stageId = stage => `stage:${stage}`;
// Keyboard dragging moves between actual stage centers, rather than arbitrary pixels.
const stageCoordinates = (event, { context }) => {
  const { active, over, droppableRects, droppableContainers, collisionRect } = context;
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.code)) return;
  event.preventDefault();
  const targets = droppableContainers.getEnabled().filter(item => droppableRects.has(item.id));
  const current = targets.findIndex(item => item.id === (over?.id || stageId(active?.data.current?.project?.stage)));
  const direction = ['ArrowLeft', 'ArrowUp'].includes(event.code) ? -1 : 1;
  const next = targets[Math.max(0, Math.min(targets.length - 1, current + direction))];
  const rect = next && droppableRects.get(next.id);
  return rect ? { x: rect.left + (rect.width - (collisionRect?.width || 0)) / 2, y: rect.top + Math.min(60, (rect.height - (collisionRect?.height || 0)) / 2) } : undefined;
};
const collisionDetection = args => {
  return args.pointerCoordinates ? pointerWithin(args) : rectIntersection(args);
};

function Stage({ stage, projects, children, surface, subtle, secondary, compact = false }) {
  const { setNodeRef, isOver } = useDroppable({ id: stageId(stage), data: { stage }, disabled: !STAGES.includes(stage) });
  return <section ref={setNodeRef} aria-label={`${stage} Active Projects`} className={`rounded-2xl min-w-0 transition-colors ${compact ? 'p-4 flex items-center justify-between gap-3 min-h-[84px]' : 'p-3 h-full'}`}
    style={{ backgroundColor: isOver ? 'rgba(74,124,89,0.12)' : subtle, outline: isOver ? '2px solid #4A7C59' : '2px solid transparent', outlineOffset: -2 }}>
    <div className={`flex items-center justify-between gap-2 ${compact ? 'flex-1' : 'px-1 pt-1 pb-4'}`}>
      <div><h2 className="text-sm font-semibold">{stage}<span className="ml-2 text-xs font-normal" style={{ color: secondary }}>{projects.length}</span></h2>
        {!compact && <p className="text-[11px] mt-1 tabular-nums" style={{ color: secondary }}>{fmtCurrency(projects.reduce((sum, p) => sum + projectListValue(p), 0))} list</p>}</div>
      {compact && <span className="text-xs" style={{ color: secondary }}>Drop to close</span>}
    </div>
    {!compact && <><div className="space-y-3">{children}</div>{!projects.length && <p className="text-xs py-10 text-center rounded-xl border border-dashed" style={{ color: secondary, borderColor: surface.border?.replace('1px solid ', '') }}>Drop a project here</p>}</>}
  </section>;
}

function DraggableProject({ project, children, surface, secondary }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({ id: `project:${project.id}`, data: { project } });
  return <div ref={setNodeRef} className="relative rounded-2xl" style={{ ...surface, opacity: isDragging ? 0.35 : 1 }}>
    <button ref={setActivatorNodeRef} {...attributes} {...listeners} type="button" aria-label={`Move ${project.name || 'Untitled project'}`} title="Drag to a stage, or use the stage menu" className="absolute right-1 top-1 w-11 h-11 flex items-center justify-center rounded-xl cursor-grab active:cursor-grabbing focus-ring" style={{ touchAction: 'none', color: secondary }}><GripVertical size={17} /></button>
    {children}
  </div>;
}

export function ProjectBoard({ stages, projects, groups, showClosed, surface, subtle, secondary, renderProject, onMove }) {
  const [dragging, setDragging] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: stageCoordinates }));
  const closedTargets = showClosed ? [] : ['Won', 'Lost'].filter(stage => !stages.includes(stage));
  return <DndContext sensors={sensors} collisionDetection={collisionDetection}
    accessibility={{ screenReaderInstructions: { draggable: 'To move a project, press Space, then arrow keys to choose a stage, then Space to drop. Press Escape to cancel. You can also use the stage menu on each project.' }, announcements: {
      onDragStart: ({ active }) => `Picked up ${active.data.current?.project?.name}.`,
      onDragOver: ({ over }) => over ? `Move to ${over.data.current?.stage}.` : 'Outside a stage.',
      onDragEnd: ({ over }) => over ? `Dropped in ${over.data.current?.stage}.` : 'Move cancelled.',
      onDragCancel: () => 'Move cancelled.',
    } }}
    onDragStart={({ active }) => setDragging(active.data.current.project)}
    onDragCancel={() => setDragging(null)}
    onDragEnd={({ active, over, activatorEvent }) => { setDragging(null); if (over?.data.current?.stage) onMove(active.data.current.project, over.data.current.stage, { focusUndo: activatorEvent?.type === 'keydown' }); }}>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 items-stretch">
      {stages.map(stage => {
        const items = projects.filter(project => (project.stage || 'Unstaged') === stage);
        return <Stage key={stage} stage={stage} projects={items} surface={surface} subtle={subtle} secondary={secondary}>
          {items.map(project => <DraggableProject key={project.id} project={project} surface={surface} secondary={secondary}>{renderProject(project, groups.find(group => group.projects.some(item => item.id === project.id))?.name, true)}</DraggableProject>)}
        </Stage>;
      })}
    </div>
    {!!closedTargets.length && <div className="grid grid-cols-2 gap-3 mt-3">{closedTargets.map(stage => <Stage key={stage} stage={stage} projects={projects.filter(project => project.stage === stage)} surface={surface} subtle={subtle} secondary={secondary} compact />)}</div>}
    <DragOverlay dropAnimation={null}>{dragging && <div className="rounded-2xl px-4 py-4 shadow-xl max-w-[320px]" style={surface}><p className="text-sm font-semibold">{dragging.name}</p><p className="text-xs mt-1" style={{ color: secondary }}>{fmtCurrency(projectListValue(dragging))} list</p></div>}</DragOverlay>
  </DndContext>;
}
