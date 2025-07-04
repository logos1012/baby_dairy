"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const env_1 = require("./env");
cloudinary_1.v2.config({
    cloud_name: env_1.config.cloudinaryCloudName,
    api_key: env_1.config.cloudinaryApiKey,
    api_secret: env_1.config.cloudinaryApiSecret,
});
exports.default = cloudinary_1.v2;
const uploadToCloudinary = async (buffer, folder, filename, resourceType = 'auto') => {
    return new Promise((resolve, reject) => {
        cloudinary_1.v2.uploader.upload_stream({
            folder,
            public_id: filename,
            resource_type: resourceType,
            quality: 'auto',
            fetch_format: 'auto',
        }, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result);
            }
        }).end(buffer);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary_1.v2.uploader.destroy(publicId, {
            resource_type: resourceType,
        });
        return result;
    }
    catch (error) {
        console.error('Cloudinary delete error:', error);
        throw error;
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
//# sourceMappingURL=cloudinary.js.map