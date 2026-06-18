const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const bcrypt = require('bcryptjs');

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    // Avoid duplicating entries on repeated runs
    const adminEmail = 'admin@shopez.com';
    const userEmail = 'user@shopez.com';

    const salt = await bcrypt.genSalt(10);

    const adminPass = await bcrypt.hash('admin123', salt);
    const userPass = await bcrypt.hash('user123', salt);

    // Upsert admin
    const admin = await User.findOneAndUpdate(
      { email: adminEmail },
      { name: 'Admin', email: adminEmail, password: adminPass, role: 'admin' },
      { upsert: true, new: true }
    );

    // Upsert demo user
    const user = await User.findOneAndUpdate(
      { email: userEmail },
      { name: 'Demo User', email: userEmail, password: userPass, role: 'user' },
      { upsert: true, new: true }
    );

    const products = [
      { name: 'Wireless Headphones', description: 'High quality sound', category: 'electronics', image: '', price: 99.99, stock: 50, discount: 10 },
      { name: 'Running Shoes', description: 'Comfortable sneakers', category: 'fashion', image: '', price: 79.99, stock: 40, discount: 0 },
      { name: 'Coffee Mug', description: 'Ceramic mug', category: 'home', image: '', price: 12.5, stock: 100, discount: 0 }
    ];

    for (const p of products) {
      await Product.findOneAndUpdate({ name: p.name }, p, { upsert: true });
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
