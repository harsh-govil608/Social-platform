import User from "../models/User.js";
import PasswordResetToken from "../models/PasswordResetToken.js";
import { sendPasswordResetEmail } from "../lib/email.js";
import { log } from '../lib/logger.js';

// Request password reset - sends email with reset link
export async function requestPasswordReset(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        // Always return success to prevent email enumeration
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If an account with that email exists, a password reset link has been sent."
            });
        }

        // Check for recent reset requests (rate limiting - max 3 per hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentTokens = await PasswordResetToken.countDocuments({
            userId: user._id,
            createdAt: { $gte: oneHourAgo }
        });

        if (recentTokens >= 3) {
            return res.status(429).json({
                message: "Too many password reset requests. Please try again later."
            });
        }

        // Invalidate any existing unused tokens for this user
        await PasswordResetToken.updateMany(
            { userId: user._id, used: false },
            { used: true }
        );

        // Generate new token
        const rawToken = PasswordResetToken.generateToken();
        const hashedToken = PasswordResetToken.hashToken(rawToken);

        // Create token record
        await PasswordResetToken.create({
            userId: user._id,
            token: hashedToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        });

        // Build reset URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

        // Send email
        try {
            await sendPasswordResetEmail(user.email, user.fullName, resetUrl);
        } catch (emailError) {
            log.error("Failed to send password reset email:", emailError);
            // Don't expose email sending failures to prevent information leakage
        }

        res.status(200).json({
            success: true,
            message: "If an account with that email exists, a password reset link has been sent."
        });

    } catch (error) {
        log.error("Error in requestPasswordReset:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Verify reset token is valid
export async function verifyResetToken(req, res) {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({ valid: false, message: "Token is required" });
        }

        const hashedToken = PasswordResetToken.hashToken(token);
        const tokenRecord = await PasswordResetToken.findOne({ token: hashedToken });

        if (!tokenRecord) {
            return res.status(400).json({ valid: false, message: "Invalid or expired token" });
        }

        if (!tokenRecord.isValid()) {
            return res.status(400).json({ valid: false, message: "Token has expired or been used" });
        }

        res.status(200).json({ valid: true, message: "Token is valid" });

    } catch (error) {
        log.error("Error in verifyResetToken:", error);
        res.status(500).json({ valid: false, message: "Internal server error" });
    }
}

// Reset password with token
export async function resetPassword(req, res) {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: "Token and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // Find and validate token
        const hashedToken = PasswordResetToken.hashToken(token);
        const tokenRecord = await PasswordResetToken.findOne({ token: hashedToken });

        if (!tokenRecord) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        if (!tokenRecord.isValid()) {
            return res.status(400).json({ message: "Token has expired or been used" });
        }

        // Find user
        const user = await User.findById(tokenRecord.userId);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Mark token as used
        tokenRecord.used = true;
        await tokenRecord.save();

        // Invalidate all other tokens for this user
        await PasswordResetToken.updateMany(
            { userId: user._id, _id: { $ne: tokenRecord._id } },
            { used: true }
        );

        res.status(200).json({
            success: true,
            message: "Password has been reset successfully. You can now log in with your new password."
        });

    } catch (error) {
        log.error("Error in resetPassword:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
