const { Router } = require('express');
const todoController = require('../controllers/todoController');
const { authenticate } = require('../middlewares/authenticate');

const router = Router();

router.use(authenticate);

router.get('/', todoController.getTodos);
router.post('/', todoController.createTodo);
router.get('/:id', todoController.getTodoById);
router.patch('/:id', todoController.updateTodo);
router.delete('/:id', todoController.deleteTodo);

module.exports = router;
