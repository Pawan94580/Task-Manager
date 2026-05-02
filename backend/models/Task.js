const db = require('../db');

/**
 * Shape a task row for API response.
 * Adds `_id` alias on task and nested objects for frontend compatibility.
 */
function format(row) {
  if (!row) return null;
  const assignedTo = row.assigned_to_data
    ? { ...row.assigned_to_data, _id: row.assigned_to_data.id }
    : null;
  const project = row.project_data
    ? { ...row.project_data, _id: row.project_data.id }
    : null;
  return {
    _id: row.id,
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date,
    assignedTo,
    project,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const TASK_SELECT = `
  SELECT t.*,
    CASE WHEN t.assigned_to IS NOT NULL THEN
      json_build_object('id', au.id, 'name', au.name, 'email', au.email)
    END AS assigned_to_data,
    json_build_object('id', p.id, 'name', p.name) AS project_data
  FROM tasks t
  LEFT JOIN users au ON au.id = t.assigned_to
  JOIN projects p ON p.id = t.project_id
`;

/** Get tasks with optional filters */
async function findAll({ projectId, status, priority, assignedTo } = {}) {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (projectId)  { conditions.push(`t.project_id = $${idx++}`);  values.push(projectId); }
  if (status)     { conditions.push(`t.status = $${idx++}`);      values.push(status); }
  if (priority)   { conditions.push(`t.priority = $${idx++}`);    values.push(priority); }
  if (assignedTo) { conditions.push(`t.assigned_to = $${idx++}`); values.push(assignedTo); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await db.query(
    `${TASK_SELECT} ${where} ORDER BY t.due_date ASC NULLS LAST`,
    values
  );
  return rows.map(format);
}

/** Create a new task */
async function create({ title, description = '', dueDate, priority = 'medium', assignedTo, projectId, createdBy }) {
  const { rows } = await db.query(
    `INSERT INTO tasks (title, description, due_date, priority, assigned_to, project_id, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [title, description, dueDate || null, priority, assignedTo || null, projectId, createdBy]
  );
  return findById(rows[0].id);
}

/** Get a single task by id */
async function findById(id) {
  const { rows } = await db.query(
    `${TASK_SELECT} WHERE t.id = $1`,
    [id]
  );
  return format(rows[0]);
}

/** Update a task — supports partial updates */
async function update(id, data) {
  const FIELD_MAP = {
    title:       'title',
    description: 'description',
    status:      'status',
    priority:    'priority',
    dueDate:     'due_date',
    assignedTo:  'assigned_to',
    project:     'project_id',
  };

  const fields = [];
  const values = [];
  let idx = 1;

  for (const [key, col] of Object.entries(FIELD_MAP)) {
    if (key in data) {
      fields.push(`${col} = $${idx++}`);
      values.push(data[key] === '' ? null : data[key]);
    }
  }

  if (fields.length === 0) return findById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  await db.query(
    `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${idx}`,
    values
  );
  return findById(id);
}

/** Delete a task — only the creator can delete */
async function destroy(id, createdBy) {
  const { rows } = await db.query(
    `DELETE FROM tasks WHERE id = $1 AND created_by = $2 RETURNING id`,
    [id, createdBy]
  );
  return rows[0] || null;
}

/** Dashboard stats */
async function getDashboardStats({ assignedTo, createdBy }) {
  const filter = assignedTo
    ? { col: 'assigned_to', val: assignedTo }
    : { col: 'created_by', val: createdBy };

  const [totalRes, completedRes, overdueRes] = await Promise.all([
    db.query(`SELECT COUNT(*) FROM tasks WHERE ${filter.col} = $1`, [filter.val]),
    db.query(`SELECT COUNT(*) FROM tasks WHERE ${filter.col} = $1 AND status = 'done'`, [filter.val]),
    db.query(
      `SELECT COUNT(*) FROM tasks WHERE ${filter.col} = $1 AND due_date < NOW() AND status != 'done'`,
      [filter.val]
    ),
  ]);

  const total     = parseInt(totalRes.rows[0].count, 10);
  const completed = parseInt(completedRes.rows[0].count, 10);
  const overdue   = parseInt(overdueRes.rows[0].count, 10);
  return { total, completed, pending: total - completed, overdue };
}

/** Check if user is a member or owner of a project */
async function isMemberOrOwner(projectId, userId) {
  const { rows } = await db.query(
    `SELECT 1 FROM projects WHERE id = $1 AND owner_id = $2
     UNION
     SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2
     LIMIT 1`,
    [projectId, userId]
  );
  return rows.length > 0;
}

module.exports = { findAll, create, findById, update, destroy, getDashboardStats, isMemberOrOwner };
