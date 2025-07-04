import { v2 as cloudinary } from 'cloudinary';
import { config } from './env';

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

export default cloudinary;

export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string,
  filename: string,
  resourceType: 'image' | 'video' | 'auto' = 'auto'
) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename,
        resource_type: resourceType,
        quality: 'auto',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string, resourceType: 'image' | 'video' = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};