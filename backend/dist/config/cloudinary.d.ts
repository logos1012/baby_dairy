import { v2 as cloudinary } from 'cloudinary';
export default cloudinary;
export declare const uploadToCloudinary: (buffer: Buffer, folder: string, filename: string, resourceType?: "image" | "video" | "auto") => Promise<unknown>;
export declare const deleteFromCloudinary: (publicId: string, resourceType?: "image" | "video") => Promise<any>;
//# sourceMappingURL=cloudinary.d.ts.map