const { z } = require('zod');

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(500).optional().default(''),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

const addMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

module.exports = { createProjectSchema, updateProjectSchema, addMemberSchema };
