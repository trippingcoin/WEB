const express = require('express');
const multer = require('multer');
const User = require('../models/user');

const router = express.Router();

// Configure Multer for Profile Picture Uploads
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Dashboard Route
router.get('/', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('dashboard', { user: req.session.user });
});

// Upload Profile Picture
router.post('/upload-profile', upload.single('profilePic'), async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    await User.findByIdAndUpdate(req.session.user._id, { profilePic: `/uploads/${req.file.filename}` });
    req.session.user.profilePic = `/uploads/${req.file.filename}`;
    res.redirect('/dashboard');
});

// Update Username
router.post('/update-user', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    await User.findByIdAndUpdate(req.session.user._id, { username: req.body.username });
    req.session.user.username = req.body.username;
    res.redirect('/dashboard');
});

// Delete Account
router.post('/delete-user', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    await User.findByIdAndDelete(req.session.user._id);
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
