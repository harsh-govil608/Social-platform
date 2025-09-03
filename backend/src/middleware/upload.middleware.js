import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = 'uploads/';
        if (file.mimetype.startsWith('image/')) {
            folder += 'images/';
        } else if (file.mimetype.startsWith('video/')) {
            folder += 'videos/';
        } else if (file.mimetype.startsWith('audio/')) {
            folder += 'audio/';
        } else {
            folder += 'others/';
        }
        
        // Create folder if it doesn't exist
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }
        
        cb(null, folder);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .substring(0, 30);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedImageTypes = /jpeg|jpg|png|gif|webp|svg/;
    const allowedVideoTypes = /mp4|avi|mov|wmv|flv|webm|mkv|m4v/;
    const allowedAudioTypes = /mp3|wav|ogg|m4a|flac|aac/;
    
    const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) ||
                   allowedVideoTypes.test(path.extname(file.originalname).toLowerCase()) ||
                   allowedAudioTypes.test(path.extname(file.originalname).toLowerCase());
    
    const mimetype = file.mimetype.startsWith('image/') || 
                    file.mimetype.startsWith('video/') ||
                    file.mimetype.startsWith('audio/');
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image, video and audio files are allowed'));
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max file size
        files: 10 // Maximum 10 files per request
    }
});

// Middleware for different upload types
export const uploadSingle = (fieldName) => upload.single(fieldName);
export const uploadMultiple = (fieldName, maxCount = 10) => upload.array(fieldName, maxCount);
export const uploadFields = (fields) => upload.fields(fields);

// Middleware to handle upload errors
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Maximum size is 100MB' });
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ message: 'Too many files. Maximum is 10 files' });
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ message: 'Unexpected field' });
        }
    } else if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};

// Helper function to delete uploaded files (in case of error)
export const deleteUploadedFiles = (files) => {
    if (!files) return;
    
    if (Array.isArray(files)) {
        files.forEach(file => {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        });
    } else {
        // Handle req.files object format
        Object.values(files).forEach(fileArray => {
            if (Array.isArray(fileArray)) {
                fileArray.forEach(file => {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                });
            }
        });
    }
};

// Generate video thumbnail (placeholder - requires ffmpeg in production)
export const generateVideoThumbnail = async (videoPath) => {
    // In production, use ffmpeg to generate actual thumbnail
    // For now, return a placeholder
    return '/api/placeholder/video-thumbnail.jpg';
};

export default upload;