const express = require('express');
const router = express.Router();
const { createOrder, getOrdersByUser, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.post('/', protect, createOrder);
router.get('/:userId', protect, getOrdersByUser);
router.put('/status/:id', protect, admin, updateOrderStatus);

module.exports = router;
