const prisma = require('../prisma');
const activity = require('../services/activityService');

const projectSelect = {
  id: true, name: true, description: true, createdAt: true, updatedAt: true,
  owner: { select: { id: true, name: true, email: true, role: true } },
  members: {
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { createdAt: 'asc' },
  },
  _count: { select: { tasks: true } },
};

function formatProject(p) {
  return {
    ...p,
    members: p.members.map((m) => m.user),
    taskCount: p._count?.tasks ?? 0,
    _count: undefined,
  };
}

exports.getProjects = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const projects = await prisma.project.findMany({
      where: isAdmin
        ? { ownerId: req.user.id }
        : { members: { some: { userId: req.user.id } } },
      select: projectSelect,
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects.map(formatProject));
  } catch (err) { next(err); }
};

exports.createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const project = await prisma.project.create({
      data: {
        name, description, ownerId: req.user.id,
        members: { create: { userId: req.user.id } },
      },
      select: projectSelect,
    });
    activity.log({ userId: req.user.id, action: 'Created project', detail: name, projectId: project.id });
    res.status(201).json(formatProject(project));
  } catch (err) { next(err); }
};

exports.getProject = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id }, select: projectSelect,
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(formatProject(project));
  } catch (err) { next(err); }
};

exports.updateProject = async (req, res, next) => {
  try {
    const project = await prisma.project.findFirst({ where: { id: req.params.id, ownerId: req.user.id } });
    if (!project) return res.status(404).json({ message: 'Project not found or not authorized' });
    const updated = await prisma.project.update({
      where: { id: req.params.id }, data: req.body, select: projectSelect,
    });
    res.json(formatProject(updated));
  } catch (err) { next(err); }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await prisma.project.findFirst({ where: { id: req.params.id, ownerId: req.user.id } });
    if (!project) return res.status(404).json({ message: 'Project not found or not authorized' });
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted' });
  } catch (err) { next(err); }
};

exports.addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: req.params.id, userId } },
      create: { projectId: req.params.id, userId },
      update: {},
    });
    const project = await prisma.project.findUnique({ where: { id: req.params.id }, select: projectSelect });
    activity.log({ userId: req.user.id, action: 'Added member', detail: user.name, projectId: req.params.id });
    res.json(formatProject(project));
  } catch (err) { next(err); }
};

exports.removeMember = async (req, res, next) => {
  try {
    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId: req.params.id, userId: req.params.userId } },
    });
    const project = await prisma.project.findUnique({ where: { id: req.params.id }, select: projectSelect });
    res.json(formatProject(project));
  } catch (err) { next(err); }
};
