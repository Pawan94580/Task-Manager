const prisma = require('../prisma');

/**
 * Log an activity event.
 * @param {object} opts
 * @param {string} opts.userId    — actor
 * @param {string} opts.action   — human-readable action label
 * @param {string} [opts.detail] — optional detail string
 * @param {string} [opts.taskId]
 * @param {string} [opts.projectId]
 */
async function log({ userId, action, detail, taskId, projectId }) {
  try {
    await prisma.activityLog.create({
      data: { userId, action, detail, taskId, projectId },
    });
  } catch (err) {
    // Activity logging should never crash the main request
    console.error('[ActivityService] Failed to log activity:', err.message);
  }
}

module.exports = { log };
