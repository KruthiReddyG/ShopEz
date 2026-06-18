const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.addToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;
  if (!userId || !productId) return res.status(400).json({ message: 'userId and productId required' });
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, products: [{ productId, quantity: quantity || 1 }] });
    } else {
      const idx = cart.products.findIndex(p => p.productId.toString() === productId);
      if (idx > -1) {
        cart.products[idx].quantity += quantity || 1;
      } else {
        cart.products.push({ productId, quantity: quantity || 1 });
      }
      await cart.save();
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate('products.productId');
    if (!cart) return res.json({ products: [] });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;
  if (!userId || !productId) return res.status(400).json({ message: 'userId and productId required' });
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const idx = cart.products.findIndex(p => p.productId.toString() === productId);
    if (idx === -1) return res.status(404).json({ message: 'Product not in cart' });
    cart.products[idx].quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeFromCart = async (req, res) => {
  const { userId, productId } = req.body;
  if (!userId || !productId) return res.status(400).json({ message: 'userId and productId required' });
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.products = cart.products.filter(p => p.productId.toString() !== productId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
