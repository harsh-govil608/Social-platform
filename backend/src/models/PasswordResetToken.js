import mongoose from 'mongoose';
import crypto from 'crypto';

const passwordResetTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    },
    used: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// TTL index - automatically delete expired tokens
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for quick lookups
passwordResetTokenSchema.index({ userId: 1 });

// Static method to generate a secure token
passwordResetTokenSchema.statics.generateToken = function() {
    return crypto.randomBytes(32).toString('hex');
};

// Static method to hash token for storage
passwordResetTokenSchema.statics.hashToken = function(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
};

// Instance method to check if token is valid
passwordResetTokenSchema.methods.isValid = function() {
    return !this.used && this.expiresAt > new Date();
};

const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);

export default PasswordResetToken;
