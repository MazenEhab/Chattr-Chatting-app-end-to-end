const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 30
    },

    nickname: {
        type: String,
        required: false,
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

    readReceipts: {
        type: Boolean,
        default: true,
    },

    showOnlineStatus: {
        type: Boolean,
        default: true,
    },

    onlineStatus: {
        type: String,
        enum: ["online", "offline", "away", "busy", "invisible"],
        default: "offline",
    },

    lastSeen: {
        type: Date,
        default: Date.now
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    otps: {
        confirmation: {
            code: String,
            expiresAt: Date,
            attempts: {
                type: Number,
                default: 0
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        },

        resetPassword: {
            code: String,
            expiresAt: Date,
            attempts: {
                type: Number,
                default: 0
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    },
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User; 
    
