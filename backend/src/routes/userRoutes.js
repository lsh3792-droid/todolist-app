const { Router } = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/authenticate');

const router = Router();

router.use(authenticate);

router.get('/me', userController.getMe);
router.patch('/me', userController.updateMe);
router.delete('/me', userController.deleteMe);

module.exports = router;
