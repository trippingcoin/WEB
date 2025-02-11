const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve static HTML files
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'static', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'static', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'static', 'register.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'static', 'dashboard.html')));

// Example authentication route (mocked for now)
app.post('/login', (req, res) => {
    console.log(req.body);
    res.redirect('/dashboard');
});

app.post('/register', (req, res) => {
    console.log(req.body);
    res.redirect('/login');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
