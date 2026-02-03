/**
 * PDF Certificate Generator
 * Uses PDFKit for generating beautiful certificates
 *
 * Install: npm install pdfkit
 */

import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

/**
 * Generate a certificate PDF
 *
 * @param {Object} certificateData - Certificate data
 * @param {Object} userData - User data
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateCertificatePDF(certificateData, userData) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });

            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Get template-specific styling
            const template = getTemplateStyles(certificateData.template);

            // Background
            doc.rect(0, 0, doc.page.width, doc.page.height)
               .fill(template.backgroundColor);

            // Border
            const borderPadding = 20;
            doc.rect(borderPadding, borderPadding,
                     doc.page.width - borderPadding * 2,
                     doc.page.height - borderPadding * 2)
               .lineWidth(3)
               .stroke(template.borderColor);

            // Inner border
            doc.rect(borderPadding + 10, borderPadding + 10,
                     doc.page.width - (borderPadding + 10) * 2,
                     doc.page.height - (borderPadding + 10) * 2)
               .lineWidth(1)
               .stroke(template.accentColor);

            // Header - Platform name
            doc.fillColor(template.accentColor)
               .fontSize(16)
               .font('Helvetica-Bold')
               .text('SKILLFORGE LEARNING PLATFORM', 0, 60, { align: 'center' });

            // Certificate title
            doc.fillColor(template.textColor)
               .fontSize(36)
               .font('Helvetica-Bold')
               .text('CERTIFICATE', 0, 100, { align: 'center' });

            doc.fontSize(20)
               .font('Helvetica')
               .text('OF ' + getCertificateTypeLabel(certificateData.type).toUpperCase(), 0, 145, { align: 'center' });

            // Decorative line
            doc.moveTo(200, 180)
               .lineTo(doc.page.width - 200, 180)
               .stroke(template.accentColor);

            // "This is to certify that"
            doc.fillColor(template.subtextColor)
               .fontSize(14)
               .font('Helvetica')
               .text('This is to certify that', 0, 200, { align: 'center' });

            // Recipient name
            doc.fillColor(template.textColor)
               .fontSize(32)
               .font('Helvetica-Bold')
               .text(userData.fullName || 'Student', 0, 225, { align: 'center' });

            // "has successfully"
            doc.fillColor(template.subtextColor)
               .fontSize(14)
               .font('Helvetica')
               .text('has successfully', 0, 275, { align: 'center' });

            // Achievement description
            doc.fillColor(template.textColor)
               .fontSize(18)
               .font('Helvetica-Bold')
               .text(certificateData.title, 0, 300, { align: 'center', width: doc.page.width - 100 });

            doc.fillColor(template.subtextColor)
               .fontSize(12)
               .font('Helvetica')
               .text(certificateData.description, 50, 340, { align: 'center', width: doc.page.width - 100 });

            // Metadata (score, rank, etc.)
            if (certificateData.metadata) {
                const metadataY = 385;
                const metadata = certificateData.metadata;
                const metaItems = [];

                if (metadata.score) metaItems.push(`Score: ${metadata.score}`);
                if (metadata.rank) metaItems.push(`Rank: #${metadata.rank}`);
                if (metadata.level) metaItems.push(`Level: ${metadata.level}`);
                if (metadata.wordsLearned) metaItems.push(`Words Mastered: ${metadata.wordsLearned}`);
                if (metadata.hoursCompleted) metaItems.push(`Hours: ${metadata.hoursCompleted}`);

                if (metaItems.length > 0) {
                    doc.fillColor(template.accentColor)
                       .fontSize(10)
                       .font('Helvetica')
                       .text(metaItems.join('  |  '), 0, metadataY, { align: 'center' });
                }
            }

            // Issue date
            const issueDate = certificateData.metadata?.issueDate || certificateData.createdAt || new Date();
            const formattedDate = new Date(issueDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            doc.fillColor(template.subtextColor)
               .fontSize(12)
               .font('Helvetica')
               .text(`Issued on ${formattedDate}`, 0, 420, { align: 'center' });

            // Signature line
            doc.moveTo(150, 480)
               .lineTo(300, 480)
               .stroke(template.textColor);

            doc.moveTo(doc.page.width - 300, 480)
               .lineTo(doc.page.width - 150, 480)
               .stroke(template.textColor);

            doc.fillColor(template.subtextColor)
               .fontSize(10)
               .font('Helvetica')
               .text('Platform Director', 150, 485, { width: 150, align: 'center' })
               .text('Certificate Authority', doc.page.width - 300, 485, { width: 150, align: 'center' });

            // Certificate ID and verification
            doc.fillColor(template.subtextColor)
               .fontSize(8)
               .font('Helvetica')
               .text(`Certificate ID: ${certificateData.certificateId}`, 0, doc.page.height - 60, { align: 'center' })
               .text(`Verify at: ${certificateData.verificationUrl || certificateData.fullVerificationUrl}`, 0, doc.page.height - 48, { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Get template-specific styles
 */
function getTemplateStyles(template) {
    const templates = {
        classic: {
            backgroundColor: '#FFFEF0',
            borderColor: '#8B7355',
            accentColor: '#8B7355',
            textColor: '#2C1810',
            subtextColor: '#5D4E37'
        },
        modern: {
            backgroundColor: '#FFFFFF',
            borderColor: '#4F46E5',
            accentColor: '#4F46E5',
            textColor: '#1F2937',
            subtextColor: '#6B7280'
        },
        minimal: {
            backgroundColor: '#FAFAFA',
            borderColor: '#E5E5E5',
            accentColor: '#171717',
            textColor: '#171717',
            subtextColor: '#737373'
        },
        achievement: {
            backgroundColor: '#FEF3C7',
            borderColor: '#D97706',
            accentColor: '#D97706',
            textColor: '#78350F',
            subtextColor: '#92400E'
        },
        contest: {
            backgroundColor: '#EFF6FF',
            borderColor: '#3B82F6',
            accentColor: '#3B82F6',
            textColor: '#1E3A8A',
            subtextColor: '#3730A3'
        }
    };

    return templates[template] || templates.modern;
}

/**
 * Get human-readable certificate type label
 */
function getCertificateTypeLabel(type) {
    const labels = {
        course: 'Completion',
        contest: 'Achievement',
        achievement: 'Achievement',
        skill: 'Proficiency',
        language_level: 'Proficiency'
    };
    return labels[type] || 'Achievement';
}

export default {
    generateCertificatePDF
};
