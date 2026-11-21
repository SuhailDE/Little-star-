import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env, isCloudinaryConfigured } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const UPLOADS_DIR = path.resolve(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
  });
}

const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export async function uploadImageAsset(file) {
  if (!file || !file.buffer) {
    throw new Error('No image file buffer provided.');
  }

  const ext = MIME_TO_EXT[file.mimetype];
  if (!ext) {
    throw new Error('Unsupported file format. Allowed: JPG, PNG, WebP.');
  }

  if (isCloudinaryConfigured()) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'little-star/gallery',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve({
            imageUrl: result.secure_url,
            publicId: result.public_id,
            storage: 'cloudinary',
          });
        }
      );
      uploadStream.end(file.buffer);
    });
  }

  // Secure local upload storage fallback with strict randomized filenames
  const randomName = `${Date.now()}-${crypto.randomBytes(12).toString('hex')}${ext}`;
  const targetPath = path.resolve(UPLOADS_DIR, randomName);
  if (!targetPath.startsWith(UPLOADS_DIR + path.sep)) {
    throw new Error('Invalid upload target path.');
  }

  await fs.promises.writeFile(targetPath, file.buffer);
  return {
    imageUrl: `/uploads/${randomName}`,
    publicId: `local:${randomName}`,
    storage: 'local',
  };
}

export async function deleteImageAsset(publicId) {
  if (!publicId || typeof publicId !== 'string') return;

  if (publicId.startsWith('local:')) {
    const filename = path.basename(publicId.slice('local:'.length));
    const targetPath = path.resolve(UPLOADS_DIR, filename);
    if (targetPath.startsWith(UPLOADS_DIR + path.sep) && fs.existsSync(targetPath)) {
      await fs.promises.unlink(targetPath).catch(() => {});
    }
    return;
  }

  if (isCloudinaryConfigured()) {
    await cloudinary.uploader.destroy(publicId).catch(() => {});
  }
}
