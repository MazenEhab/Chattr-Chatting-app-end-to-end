const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 30
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    isEmailVerified: {
        type: Boolean,
        default: false,
    },
        
    accountStatus: {
        type: String,
        enum: ["active", "suspended", "deactivated"],
        default: "active",
    },

    lastSeen: {
        type: Date,
        default: Date.now
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User; 
    
