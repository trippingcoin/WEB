const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const multer = require('multer');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Atlas Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// Define User Model
const UserSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "user" },
    profilePic: { type: String, default: "/uploads/1739298843717-DAA.png" }
});

const User = mongoose.model('User', UserSchema);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key',
    resave: false,
    saveUninitialized: false
}));
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Configure Multer for Profile Picture Uploads
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Serve HTML files
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'static', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'static', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'static', 'register.html')));
app.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.sendFile(path.join(__dirname, 'static', 'dashboard.html'));
});

// Authentication Routes
app.post('/auth/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send("Error: All fields are required.");
    }

    if (password.length > 6) {
        return res.status(400).send("Error: Password must be a maximum of 6 characters.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();
    res.redirect('/login');
});


app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).send("Invalid email or password.");
    }

    req.session.user = user;
    res.redirect('/dashboard');
});

app.post('/auth/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Admin Role-Based Access
app.get('/admin', (req, res) => {
    if (!req.session.user || req.session.user.role !== "admin") {
        return res.status(403).send("Access Denied: Admins Only");
    }
    res.send("🎉 Welcome Admin! You have full access.");
});

app.get('/get-user', (req, res) => {
    if (!req.session.user) return res.json({ role: "guest" });
    res.json({ role: req.session.user.role });
});


// Update Username
app.post('/update-user', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    try {
        await User.findByIdAndUpdate(req.session.user._id, { username: req.body.username });
        req.session.user.username = req.body.username;
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Error updating username:', err);
        res.status(500).send('Error updating username.');
    }
});

// Delete User
app.post('/delete-user', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    try {
        await User.findByIdAndDelete(req.session.user._id);
        req.session.destroy();
        res.redirect('/');
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).send('Error deleting account.');
    }
});

// Profile Picture Upload Route
app.post('/upload-profile', upload.single('profilePic'), async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    await User.findByIdAndUpdate(req.session.user._id, { profilePic: `/uploads/${req.file.filename}` });
    req.session.user.profilePic = `/uploads/${req.file.filename}`;

    res.redirect('/dashboard');
});

app.get('/get-profile-pic', (req, res) => {
    if (!req.session.user) {
        return res.json({ profilePic: "/uploads/1739298843717-DAA.png" });
    }
    res.json({ profilePic: req.session.user.profilePic || "/uploads/1739298843717-DAA.png" });
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
