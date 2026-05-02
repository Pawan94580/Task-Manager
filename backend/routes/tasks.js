const router = require('express').Router();
const { protect, adminOnly } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createTaskSchema, updateTaskSchema } = require('../validations/taskValidation');
const { getTasks, createTask, updateTask, deleteTask, getDashboard } = require('../controllers/taskController');

router.use(protect);

router.get('/dashboard', getDashboard);
router.route('/').get(getTasks).post(adminOnly, validate(createTaskSchema), createTask);
router.route('/:id').put(validate(updateTaskSchema), updateTask).delete(adminOnly, deleteTask);

module.exports = router;
