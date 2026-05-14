const { Router } = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const todoRoutes = require('./todoRoutes');
const categoryRoutes = require('./categoryRoutes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/todos', todoRoutes);
router.use('/categories', categoryRoutes);

module.exports = router;
