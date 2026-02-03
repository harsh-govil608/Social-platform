import crypto from 'crypto';
import User from "../models/User.js";
import { sendEmail } from "../lib/email.js";

// Generate verification token helper
const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Hash token for storage
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

// Send verification email
export async function sendVerificationEmail(req, res) {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: "Email is already verified" });
        }

        // Check rate limiting - max 3 requests per hour
        if (user.emailVerificationExpires && user.emailVerificationExpires > new Date()) {
            const timeSinceLastRequest = Date.now() - (user.emailVerificationExpires.getTime() - 24 * 60 * 60 * 1000);
            if (timeSinceLastRequest < 5 * 60 * 1000) { // 5 minutes cooldown
                return res.status(429).json({
                    message: "Please wait before requesting another verification email"
                });
            }
        }

        // Generate new token
        const rawToken = generateVerificationToken();
        const hashedToken = hashToken(rawToken);

        // Update user with verification token (expires in 24 hours)
        user.emailVerificationToken = hashedToken;
        user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        // Build verification URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verificationUrl = `${frontendUrl}/verify-email/${rawToken}`;

        // Send email
        await sendEmail({
            to: user.email,
            subject: 'Verify your email address',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #333;">Verify your email</h1>
                    <p>Hi ${user.fullName},</p>
                    <p>Please verify your email address by clicking the button below:</p>
                    <a href="${verificationUrl}"
                       style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                        Verify Email
                    </a>
                    <p style="color: #666;">This link will expire in 24 hours.</p>
                    <p style="color: #666; font-size: 14px; margin-top: 30px;">
                        If you didn't create an account, you can safely ignore this email.
                    </p>
                </div>
            `,
            text: `Hi ${user.fullName}, verify your email: ${verificationUrl}`
        });

        res.status(200).json({
            success: true,
            message: "Verification email sent. Please check your inbox."
        });

    } catch (error) {
        console.error("Error in sendVerificationEmail:", error);
        res.status(500).json({ message: "Failed to send verification email" });
    }
}

// Verify email with token
export async function verifyEmail(req, res) {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({ message: "Verification token is required" });
        }

        const hashedToken = hashToken(token);

        // Find user with matching token that hasn't expired
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired verification link. Please request a new one."
            });
        }

        if (user.isEmailVerified) {
            return res.status(200).json({
                success: true,
                message: "Email is already verified"
            });
        }

        // Mark email as verified and clear token
        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Email verified successfully!"
        });

    } catch (error) {
        console.error("Error in verifyEmail:", error);
        res.status(500).json({ message: "Failed to verify email" });
    }
}

// Resend verification email (public route - uses email instead of auth)
export async function resendVerificationEmail(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        // Always return success to prevent email enumeration
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If your email is registered and not yet verified, you will receive a verification link."
            });
        }

        if (user.isEmailVerified) {
            return res.status(200).json({
                success: true,
                message: "If your email is registered and not yet verified, you will receive a verification link."
            });
        }

        // Check cooldown
        if (user.emailVerificationExpires) {
            const tokenAge = Date.now() - (user.emailVerificationExpires.getTime() - 24 * 60 * 60 * 1000);
            if (tokenAge < 2 * 60 * 1000) { // 2 minute cooldown
                return res.status(429).json({
                    message: "Please wait before requesting another verification email"
                });
            }
        }

        // Generate new token
        const rawToken = generateVerificationToken();
        const hashedToken = hashToken(rawToken);

        user.emailVerificationToken = hashedToken;
        user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        // Build verification URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verificationUrl = `${frontendUrl}/verify-email/${rawToken}`;

        // Send email
        try {
            await sendEmail({
                to: user.email,
                subject: 'Verify your email address',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #333;">Verify your email</h1>
                        <p>Hi ${user.fullName},</p>
                        <p>Please verify your email address by clicking the button below:</p>
                        <a href="${verificationUrl}"
                           style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                            Verify Email
                        </a>
                        <p style="color: #666;">This link will expire in 24 hours.</p>
                        <p style="color: #666; font-size: 14px; margin-top: 30px;">
                            If you didn't request this, you can safely ignore this email.
                        </p>
                    </div>
                `,
                text: `Hi ${user.fullName}, verify your email: ${verificationUrl}`
            });
        } catch (emailError) {
            console.error("Failed to send verification email:", emailError);
        }

        res.status(200).json({
            success: true,
            message: "If your email is registered and not yet verified, you will receive a verification link."
        });

    } catch (error) {
        console.error("Error in resendVerificationEmail:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Check verification status (for authenticated users)
export async function getVerificationStatus(req, res) {
    try {
        const user = await User.findById(req.user._id).select('isEmailVerified email');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
            isEmailVerified: user.isEmailVerified,
            email: user.email
        });

    } catch (error) {
        console.error("Error in getVerificationStatus:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
