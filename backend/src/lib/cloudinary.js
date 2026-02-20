import { v2 as cloudinary } from 'cloudinary';

const isConfigured = () =>
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  !process.env.CLOUDINARY_CLOUD_NAME.startsWith('your_');

if (isConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Cloudinary configured');
} else {
  console.log('⚠️  Cloudinary not configured. Add CLOUDINARY_* vars to .env for cloud image storage.');
}

/**
 * Upload a file buffer or local path to Cloudinary.
 * @param {string} filePathOrBase64 - Local file path or base64 data URI
 * @param {object} options - Cloudinary upload options (folder, transformation, etc.)
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadToCloudinary = async (filePathOrBase64, options = {}) => {
  if (!isConfigured()) {
    throw new Error('Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file.');
  }

  const result = await cloudinary.uploader.upload(filePathOrBase64, {
    folder: options.folder || 'streamify',
    resource_type: options.resource_type || 'auto',
    transformation: options.transformation,
    public_id: options.public_id,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

/**
 * Upload a profile picture. Auto-crops to square and optimizes.
 */
export const uploadProfilePic = async (filePathOrBase64, userId) => {
  return uploadToCloudinary(filePathOrBase64, {
    folder: 'streamify/profile-pics',
    public_id: `user-${userId}`,
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });
};

/**
 * Delete a file from Cloudinary by its public ID.
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!isConfigured()) return;
  await cloudinary.uploader.destroy(publicId);
};

export { cloudinary, isConfigured };
