const router = require('express').Router();
const { protect, adminOnly } = require('../middlewares/auth');
const { getUsers, updateRole } = require('../controllers/userController');

router.use(protect);
router.get('/', getUsers);
router.put('/:id/role', adminOnly, updateRole);

module.exports = router;
