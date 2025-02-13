const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "user" },
    profilePic: { type: String, default: "/uploads/default-profile.png" },
    twoFASecret: String,  // Stores 2FA secret key
    is2FAEnabled: { type: Boolean, default: false }  // Tracks if 2FA is enabled
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
