const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB Atlas Connected'))
  .catch(err => console.log('❌ MongoDB Connection Error:', err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key',
    resave: false,
    saveUninitialized: false
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, 'public')));

// Serve HTML files
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'static', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'static', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'static', 'register.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'static', 'dashboard.html')));

// Authentication Routes (Mocked for Testing)
app.post('/login', (req, res) => {
    console.log(req.body);
    res.redirect('/dashboard');
});

app.post('/register', (req, res) => {
    console.log(req.body);
    res.redirect('/login');
});

app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
