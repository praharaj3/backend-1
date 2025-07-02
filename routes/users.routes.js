const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ✅ GET: Render registration page
router.get('/register', (req, res) => {
  res.render('register');
});

// ✅ POST: Register a new user with validations
router.post('/register',
  [
    body('email').trim().isEmail().withMessage('Enter a valid email').isLength({ min: 10 }),
    body('password').trim().isLength({ min: 5 }).withMessage('Password must be at least 5 characters'),
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "Validation failed, please check your input."
      });
    }

    const { email, username, password } = req.body;

    try {
      // ✅ Hash the password before saving
      const hashPassword = await bcrypt.hash(password, 10);

      // ✅ Create user in database
      const newUser = await userModel.create({
        email,
        username,
        password: hashPassword
      });

      res.json({ message: "User registered successfully", user: newUser });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// ✅ GET: Render login page
router.get('/login', (req, res) => {
  res.render('login');
});

// ✅ POST: Login route
router.post('/login',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be valid'),
    body('password').trim().isLength({ min: 5 }).withMessage('Password must be at least 5 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Invalid input data'
      });
    }

    const { username, password } = req.body;

    try {
      const user = await userModel.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: 'Username or password is incorrect' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Username or password is incorrect' });
      }

      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          username: user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Set cookie with options
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000 // 1 hour
      });

      // Redirect or send JSON (choose one)
      res.redirect('/home'); // For web app
      // OR
      // res.json({ message: 'Login successful', token });

    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

module.exports = router;
