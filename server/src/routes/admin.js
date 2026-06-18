const express = require('express');
const router = express.Router();
const { getAllUsers, getAllOrders, manageInventory } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.get('/users', protect, admin, getAllUsers);
router.get('/orders', protect, admin, getAllOrders);
router.put('/inventory', protect, admin, manageInventory);

module.exports = router;
