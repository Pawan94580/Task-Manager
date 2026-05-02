const prisma = require('../prisma');
const activity = require('../services/activityService');

const taskInclude = {
  assignedTo: { select: { id: true, name: true, email: true } },
  project: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
};

function formatTask(t) {
  return {
    ...t,
    isOverdue: t.dueDate && t.status !== 'DONE' && new Date(t.dueDate) < new Date(),
  };
}

exports.getTasks = async (req, res, next) => {
  try {
    const { projectId, status, priority, assignedToId, search } = req.query;
    const where = {};
    if (req.user.role === 'MEMBER') where.assignedToId = req.user.id;
    else if (assignedToId) where.assignedToId = assignedToId;
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) where.title = { contains: search, mode: 'insensitive' };

    const tasks = await prisma.task.findMany({
      where, include: taskInclude, orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });
    res.json(tasks.map(formatTask));
  } catch (err) { next(err); }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assignedToId, projectId } = req.body;
    // Verify project membership
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: req.user.id } },
    });
    if (!member) return res.status(403).json({ message: 'You are not a member of this project' });

    const task = await prisma.task.create({
      data: {
        title, description, status, priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedToId: assignedToId || null,
        projectId, createdById: req.user.id,
      },
      include: taskInclude,
    });
    activity.log({
      userId: req.user.id, action: 'Created task', detail: title,
      taskId: task.id, projectId,
    });
    res.status(201).json(formatTask(task));
  } catch (err) { next(err); }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role === 'MEMBER') {
      if (task.assignedToId !== req.user.id)
        return res.status(403).json({ message: 'Not authorized' });
      // Members can only change status
      const { status } = req.body;
      const updated = await prisma.task.update({
        where: { id: req.params.id },
        data: { status: status ?? task.status },
        include: taskInclude,
      });
      activity.log({ userId: req.user.id, action: 'Updated status', detail: `→ ${status}`, taskId: task.id });
      return res.json(formatTask(updated));
    }

    const { title, description, status, priority, dueDate, assignedToId } = req.body;
    const oldStatus = task.status;
    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assignedToId !== undefined && { assignedToId: assignedToId || null }),
      },
      include: taskInclude,
    });
    if (status && status !== oldStatus)
      activity.log({ userId: req.user.id, action: 'Changed status', detail: `${oldStatus} → ${status}`, taskId: task.id });
    res.json(formatTask(updated));
  } catch (err) { next(err); }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, createdById: req.user.id },
    });
    if (!task) return res.status(404).json({ message: 'Task not found or not authorized' });
    activity.log({ userId: req.user.id, action: 'Deleted task', detail: task.title, projectId: task.projectId });
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted' });
  } catch (err) { next(err); }
};

exports.getDashboard = async (req, res, next) => {
  try {
    const filter = req.user.role === 'MEMBER'
      ? { assignedToId: req.user.id }
      : { createdById: req.user.id };

    const now = new Date();
    const [total, completed, overdue, allTasks] = await Promise.all([
      prisma.task.count({ where: filter }),
      prisma.task.count({ where: { ...filter, status: 'DONE' } }),
      prisma.task.count({ where: { ...filter, dueDate: { lt: now }, status: { not: 'DONE' } } }),
      prisma.task.findMany({
        where: filter,
        include: { assignedTo: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ]);

    // Tasks per user (for bar chart)
    const byUserMap = {};
    allTasks.forEach((t) => {
      const name = t.assignedTo?.name || 'Unassigned';
      byUserMap[name] = (byUserMap[name] || 0) + 1;
    });
    const byUser = Object.entries(byUserMap).map(([name, count]) => ({ name, count }));

    // Status breakdown (for pie chart)
    const byStatus = [
      { name: 'To Do', value: allTasks.filter((t) => t.status === 'TODO').length, color: '#6366f1' },
      { name: 'In Progress', value: allTasks.filter((t) => t.status === 'IN_PROGRESS').length, color: '#f59e0b' },
      { name: 'Done', value: allTasks.filter((t) => t.status === 'DONE').length, color: '#10b981' },
    ];

    res.json({ total, completed, pending: total - completed, overdue, byUser, byStatus });
  } catch (err) { next(err); }
};
