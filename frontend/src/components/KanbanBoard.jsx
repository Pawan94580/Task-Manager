import { useState } from 'react';
import {
  DndContext, DragOverlay, closestCorners,
  PointerSensor, TouchSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const COLUMNS = [
  { id: 'TODO',        label: 'To Do',       color: '#6366f1', dot: '#818cf8' },
  { id: 'IN_PROGRESS', label: 'In Progress',  color: '#f59e0b', dot: '#fbbf24' },
  { id: 'DONE',        label: 'Done',         color: '#10b981', dot: '#34d399' },
];

const PRIORITY_BADGE = {
  LOW:    { cls: 'badge-low',    label: 'Low'    },
  MEDIUM: { cls: 'badge-medium', label: 'Medium' },
  HIGH:   { cls: 'badge-high',   label: 'High'   },
};

function isOverdue(task) {
  return task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < new Date();
}

function TaskItem({ task, isAdmin, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const overdue = isOverdue(task);
  const pb = PRIORITY_BADGE[task.priority] || PRIORITY_BADGE.MEDIUM;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="task-card"
      {...attributes}
      {...listeners}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <p style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.4 }}>{task.title}</p>
        {isAdmin && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onDelete(task.id)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#f43f5e', fontSize: 16, flexShrink: 0, padding: '0 2px' }}
            title="Delete task"
          >×</button>
        )}
      </div>
      {task.description && (
        <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 6, lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {task.description}
        </p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
        <span className={`badge ${pb.cls}`}>{pb.label}</span>
        {task.assignedTo && (
          <span className="badge" style={{ background: 'rgba(99,102,241,.1)', color: '#6366f1' }}>
            👤 {task.assignedTo.name}
          </span>
        )}
        {task.dueDate && (
          <span className={`badge ${overdue ? 'badge-overdue' : ''}`} style={!overdue ? { background: 'var(--color-bg)', color: 'var(--color-muted)' } : {}}>
            {overdue ? '⚠ ' : '📅 '}
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

function Column({ col, tasks, isAdmin, onDelete }) {
  const { setNodeRef } = useSortable({ id: col.id });
  return (
    <div ref={setNodeRef} className="kanban-col" style={{ borderTop: `3px solid ${col.color}` }}>
      <div className="kanban-col-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.dot, display: 'inline-block' }} />
          <span style={{ color: col.color }}>{col.label}</span>
        </div>
        <span style={{
          background: `${col.color}22`, color: col.color,
          borderRadius: 20, padding: '2px 8px', fontSize: 12, fontWeight: 700,
        }}>{tasks.length}</span>
      </div>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div style={{ minHeight: 80 }}>
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} isAdmin={isAdmin} onDelete={onDelete} />
          ))}
          {tasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-muted)', fontSize: 13 }}>
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard({ tasks, isAdmin, onStatusChange, onDelete }) {
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const byStatus = (id) => tasks.filter((t) => t.status === id);

  const handleDragStart = ({ active }) => {
    setActiveTask(tasks.find((t) => t.id === active.id) || null);
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null);
    if (!over || active.id === over.id) return;

    // Find destination column
    const destCol = COLUMNS.find((c) => c.id === over.id || byStatus(c.id).some((t) => t.id === over.id));
    if (!destCol) return;

    const task = tasks.find((t) => t.id === active.id);
    if (task && task.status !== destCol.id) {
      onStatusChange(task.id, destCol.id);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
        {COLUMNS.map((col) => (
          <Column key={col.id} col={col} tasks={byStatus(col.id)} isAdmin={isAdmin} onDelete={onDelete} />
        ))}
      </div>
      <DragOverlay>
        {activeTask && (
          <div className="task-card" style={{ boxShadow: '0 16px 40px rgba(0,0,0,.2)', transform: 'rotate(2deg)' }}>
            <p style={{ fontWeight: 600, fontSize: 14 }}>{activeTask.title}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
