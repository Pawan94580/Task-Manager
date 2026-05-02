const prisma = require('../prisma');

exports.getActivity = async (req, res, next) => {
  try {
    const { projectId, taskId, limit = 50 } = req.query;
    const where = {};
    if (projectId) where.projectId = projectId;
    if (taskId) where.taskId = taskId;
    // Members only see activity related to their tasks
    if (req.user.role === 'MEMBER') {
      where.OR = [
        { userId: req.user.id },
        { task: { assignedToId: req.user.id } },
      ];
    }
    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit), 100),
    });
    res.json(logs);
  } catch (err) { next(err); }
};
