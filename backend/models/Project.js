const db = require('../db');

/**
 * Shape a project row (with owner/members JSON) for the API response.
 * Adds `_id` alias so the frontend works without any changes.
 */
function format(row) {
  if (!row) return null;
  const owner = row.owner
    ? { ...row.owner, _id: row.owner.id }
    : null;
  const members = (row.members || []).map((m) => ({ ...m, _id: m.id }));
  return { ...row, _id: row.id, owner, members };
}

/** Projects where the user is the owner */
async function findByOwner(ownerId) {
  const { rows } = await db.query(
    `SELECT p.*,
            json_build_object('id', u.id, 'name', u.name, 'email', u.email) AS owner,
            COALESCE(
              json_agg(
                json_build_object('id', mu.id, 'name', mu.name, 'email', mu.email, 'role', mu.role)
              ) FILTER (WHERE mu.id IS NOT NULL),
              '[]'
            ) AS members
     FROM projects p
     JOIN users u ON u.id = p.owner_id
     LEFT JOIN project_members pm ON pm.project_id = p.id
     LEFT JOIN users mu ON mu.id = pm.user_id
     WHERE p.owner_id = $1
     GROUP BY p.id, u.id
     ORDER BY p.created_at DESC`,
    [ownerId]
  );
  return rows.map(format);
}

/** Projects where the user is a member (but not necessarily the owner) */
async function findByMember(userId) {
  const { rows } = await db.query(
    `SELECT p.*,
            json_build_object('id', u.id, 'name', u.name, 'email', u.email) AS owner,
            COALESCE(
              json_agg(
                json_build_object('id', mu.id, 'name', mu.name, 'email', mu.email, 'role', mu.role)
              ) FILTER (WHERE mu.id IS NOT NULL),
              '[]'
            ) AS members
     FROM projects p
     JOIN users u ON u.id = p.owner_id
     LEFT JOIN project_members pm ON pm.project_id = p.id
     LEFT JOIN users mu ON mu.id = pm.user_id
     WHERE p.id IN (
       SELECT project_id FROM project_members WHERE user_id = $1
     )
     GROUP BY p.id, u.id
     ORDER BY p.created_at DESC`,
    [userId]
  );
  return rows.map(format);
}

/** Get a single project by id with owner and members */
async function findById(id) {
  const { rows } = await db.query(
    `SELECT p.*,
            json_build_object('id', u.id, 'name', u.name, 'email', u.email) AS owner,
            COALESCE(
              json_agg(
                json_build_object('id', mu.id, 'name', mu.name, 'email', mu.email, 'role', mu.role)
              ) FILTER (WHERE mu.id IS NOT NULL),
              '[]'
            ) AS members
     FROM projects p
     JOIN users u ON u.id = p.owner_id
     LEFT JOIN project_members pm ON pm.project_id = p.id
     LEFT JOIN users mu ON mu.id = pm.user_id
     WHERE p.id = $1
     GROUP BY p.id, u.id`,
    [id]
  );
  return format(rows[0]);
}

/** Create a project and add the owner as a member automatically */
async function create({ name, description = '', ownerId }) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO projects (name, description, owner_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description, ownerId]
    );
    const project = rows[0];
    // Add owner to project_members automatically
    await client.query(
      `INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [project.id, ownerId]
    );
    await client.query('COMMIT');
    return findById(project.id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Update project (only owner can do this) */
async function update(id, ownerId, { name, description }) {
  const fields = [];
  const values = [];
  let idx = 1;
  if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
  if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
  if (fields.length === 0) return findById(id);
  fields.push(`updated_at = NOW()`);
  values.push(id, ownerId);
  const { rows } = await db.query(
    `UPDATE projects SET ${fields.join(', ')}
     WHERE id = $${idx++} AND owner_id = $${idx}
     RETURNING id`,
    values
  );
  if (!rows[0]) return null;
  return findById(rows[0].id);
}

/** Delete project (only owner can do this) */
async function destroy(id, ownerId) {
  const { rows } = await db.query(
    `DELETE FROM projects WHERE id = $1 AND owner_id = $2 RETURNING id`,
    [id, ownerId]
  );
  return rows[0] || null;
}

/** Add a member to a project */
async function addMember(projectId, userId) {
  await db.query(
    `INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [projectId, userId]
  );
  return findById(projectId);
}

/** Remove a member from a project */
async function removeMember(projectId, userId) {
  await db.query(
    `DELETE FROM project_members WHERE project_id = $1 AND user_id = $2`,
    [projectId, userId]
  );
  return findById(projectId);
}

module.exports = { findByOwner, findByMember, findById, create, update, destroy, addMember, removeMember };
