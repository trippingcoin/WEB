const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const router = express.Router();

// Registration Route
router.get('/register', (req, res) => {
    res.render('register', { error: null });
});

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.render('register', { error: 'All fields are required!' });
    }
    
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.render('register', { error: 'Email already registered!' });
    }

    try {
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        res.status(500).send('Error registering user');
    }
});

// Login Route
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.render('login', { error: 'Invalid email or password' });
    }

    req.session.user = user;
    res.redirect('/dashboard');
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
