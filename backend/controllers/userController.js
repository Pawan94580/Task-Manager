const prisma = require('../prisma');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(users);
  } catch (err) { next(err); }
};

exports.updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['ADMIN', 'MEMBER'].includes(role))
      return res.status(400).json({ message: 'Role must be ADMIN or MEMBER' });
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(user);
  } catch (err) { next(err); }
};
