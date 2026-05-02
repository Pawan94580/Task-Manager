const router = require('express').Router();
const { protect } = require('../middlewares/auth');
const { getActivity } = require('../controllers/activityController');

router.use(protect);
router.get('/', getActivity);

module.exports = router;
