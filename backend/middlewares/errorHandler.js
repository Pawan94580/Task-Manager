// Global error handler — must be last middleware in Express
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Prisma known request errors (e.g. unique constraint)
  if (err.code === 'P2002') {
    return res.status(409).json({ message: 'A record with that value already exists.' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Record not found.' });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
