const { Router } = require('express');
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middlewares/authenticate');

const router = Router();

router.use(authenticate);

router.get('/', categoryController.getCategories);
router.post('/', categoryController.createCategory);
router.patch('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
