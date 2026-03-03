import Certificate from '../models/Certificate.js';
import User from '../models/User.js';
import { generateCertificatePDF } from '../lib/pdfGenerator.js';
import { log } from '../lib/logger.js';

/**
 * Get all certificates for the authenticated user
 */
export async function getUserCertificates(req, res) {
    try {
        const userId = req.user._id;
        const { type, page = 1, limit = 20 } = req.query;

        const query = { userId };
        if (type) query.type = type;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [certificates, total] = await Promise.all([
            Certificate.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Certificate.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            certificates,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        log.error('Error in getUserCertificates:', error);
        res.status(500).json({ message: 'Failed to get certificates' });
    }
}

/**
 * Get a single certificate by ID
 */
export async function getCertificate(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        const certificate = await Certificate.findById(id)
            .populate('userId', 'fullName profilePic');

        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        // Check if user owns the certificate or it's public
        const isOwner = userId && certificate.userId._id.toString() === userId.toString();
        if (!isOwner && !certificate.isPublic) {
            return res.status(403).json({ message: 'This certificate is private' });
        }

        res.status(200).json({
            success: true,
            certificate,
            isOwner
        });
    } catch (error) {
        log.error('Error in getCertificate:', error);
        res.status(500).json({ message: 'Failed to get certificate' });
    }
}

/**
 * Verify a certificate by its unique ID (public endpoint)
 */
export async function verifyCertificate(req, res) {
    try {
        const { certificateId } = req.params;

        const certificate = await Certificate.findOne({ certificateId })
            .populate('userId', 'fullName profilePic');

        if (!certificate) {
            return res.status(404).json({
                verified: false,
                message: 'Certificate not found'
            });
        }

        // Check if certificate is expired
        if (certificate.isExpired) {
            return res.status(200).json({
                verified: false,
                message: 'This certificate has expired',
                certificate: {
                    title: certificate.title,
                    recipientName: certificate.userId.fullName,
                    issuedAt: certificate.createdAt,
                    expiresAt: certificate.expiresAt
                }
            });
        }

        res.status(200).json({
            verified: true,
            message: 'Certificate is valid',
            certificate: {
                id: certificate._id,
                certificateId: certificate.certificateId,
                type: certificate.type,
                title: certificate.title,
                description: certificate.description,
                recipientName: certificate.userId.fullName,
                recipientProfilePic: certificate.userId.profilePic,
                metadata: certificate.metadata,
                issuedAt: certificate.createdAt,
                template: certificate.template
            }
        });
    } catch (error) {
        log.error('Error in verifyCertificate:', error);
        res.status(500).json({ verified: false, message: 'Verification failed' });
    }
}

/**
 * Download certificate as PDF
 */
export async function downloadCertificate(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const certificate = await Certificate.findOne({
            _id: id,
            userId
        });

        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        const user = await User.findById(userId).select('fullName email');

        // Generate PDF
        const pdfBuffer = await generateCertificatePDF(certificate, user);

        // Set headers for PDF download
        const filename = `certificate-${certificate.certificateId}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        res.send(pdfBuffer);
    } catch (error) {
        log.error('Error in downloadCertificate:', error);
        res.status(500).json({ message: 'Failed to generate certificate PDF' });
    }
}

/**
 * Update certificate visibility (public/private)
 */
export async function updateCertificateVisibility(req, res) {
    try {
        const { id } = req.params;
        const { isPublic } = req.body;
        const userId = req.user._id;

        const certificate = await Certificate.findOneAndUpdate(
            { _id: id, userId },
            { isPublic },
            { new: true }
        );

        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        res.status(200).json({
            success: true,
            message: `Certificate is now ${isPublic ? 'public' : 'private'}`,
            certificate
        });
    } catch (error) {
        log.error('Error in updateCertificateVisibility:', error);
        res.status(500).json({ message: 'Failed to update certificate' });
    }
}

/**
 * Get certificate statistics for user
 */
export async function getCertificateStats(req, res) {
    try {
        const userId = req.user._id;

        const stats = await Certificate.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        const total = await Certificate.countDocuments({ userId });

        const byType = {};
        stats.forEach(s => {
            byType[s._id] = s.count;
        });

        res.status(200).json({
            success: true,
            stats: {
                total,
                byType
            }
        });
    } catch (error) {
        log.error('Error in getCertificateStats:', error);
        res.status(500).json({ message: 'Failed to get certificate stats' });
    }
}

/**
 * Issue a new certificate (admin or system)
 */
export async function issueCertificate(req, res) {
    try {
        const {
            userId,
            type,
            title,
            description,
            referenceType,
            referenceId,
            metadata,
            template
        } = req.body;

        if (!userId || !type || !title || !description) {
            return res.status(400).json({
                message: 'userId, type, title, and description are required'
            });
        }

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check for duplicate certificate
        const existingCert = await Certificate.findOne({
            userId,
            type,
            referenceType,
            referenceId
        });

        if (existingCert) {
            return res.status(400).json({
                message: 'User already has this certificate',
                certificate: existingCert
            });
        }

        const certificate = await Certificate.create({
            userId,
            type,
            title,
            description,
            referenceType,
            referenceId,
            metadata: {
                ...metadata,
                issueDate: new Date()
            },
            template: template || 'modern'
        });

        res.status(201).json({
            success: true,
            message: 'Certificate issued successfully',
            certificate
        });
    } catch (error) {
        log.error('Error in issueCertificate:', error);
        res.status(500).json({ message: 'Failed to issue certificate' });
    }
}

/**
 * Get public certificates by user ID (for profile display)
 */
export async function getPublicCertificates(req, res) {
    try {
        const { userId } = req.params;

        const certificates = await Certificate.find({
            userId,
            isPublic: true
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('-userId');

        res.status(200).json({
            success: true,
            certificates
        });
    } catch (error) {
        log.error('Error in getPublicCertificates:', error);
        res.status(500).json({ message: 'Failed to get certificates' });
    }
}
