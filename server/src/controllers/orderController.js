const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  try {
    const { userId, address, paymentMethod } = req.body;
    if (!userId || !address || !paymentMethod) return res.status(400).json({ message: 'Missing fields' });
    const cart = await Cart.findOne({ userId }).populate('products.productId');
    if (!cart || cart.products.length === 0) return res.status(400).json({ message: 'Cart is empty' });
    const products = cart.products.map(p => ({ productId: p.productId._id, quantity: p.quantity, price: p.productId.price }));
    const totalPrice = products.reduce((sum, p) => sum + p.quantity * p.price, 0);
    const order = await Order.create({ userId, products, address, paymentMethod, totalPrice });
    // clear cart
    cart.products = [];
    await cart.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
