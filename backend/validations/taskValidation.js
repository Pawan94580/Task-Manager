const { z } = require('zod');

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional().default(''),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional().default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('MEDIUM'),
  dueDate: z.string().datetime({ offset: true }).optional().nullable()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()),
  assignedToId: z.string().uuid().optional().nullable(),
  projectId: z.string().uuid('Invalid project ID'),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().optional().nullable(),
  assignedToId: z.string().uuid().optional().nullable(),
});

module.exports = { createTaskSchema, updateTaskSchema };
