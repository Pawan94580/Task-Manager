const router = require('express').Router();
const { protect, adminOnly } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createProjectSchema, updateProjectSchema, addMemberSchema } = require('../validations/projectValidation');
const {
  getProjects, createProject, getProject,
  updateProject, deleteProject, addMember, removeMember,
} = require('../controllers/projectController');

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(adminOnly, validate(createProjectSchema), createProject);

router.route('/:id')
  .get(getProject)
  .put(adminOnly, validate(updateProjectSchema), updateProject)
  .delete(adminOnly, deleteProject);

router.post('/:id/members', adminOnly, validate(addMemberSchema), addMember);
router.delete('/:id/members/:userId', adminOnly, removeMember);

module.exports = router;
