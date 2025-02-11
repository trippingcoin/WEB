const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "user" } // Default role is "user"
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
