import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { MulterRequest, UploadedFile } from '../middleware/upload';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';
import { optimizeImage, createThumbnail, generateFileName, isImage, isVideo } from '../utils/fileUpload';

export const uploadFiles = async (req: AuthRequest & MulterRequest, res: Response) => {
  try {
    const files = req.files as UploadedFile[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '업로드할 파일이 없습니다.',
      });
    }

    const uploadPromises = files.map(async (file) => {
      try {
        let optimizedBuffer = file.buffer;
        let thumbnailBuffer: Buffer | null = null;
        
        // 이미지인 경우 최적화 및 썸네일 생성
        if (isImage(file.mimetype)) {
          optimizedBuffer = await optimizeImage(file.buffer);
          thumbnailBuffer = await createThumbnail(file.buffer);
        }
        
        // 메인 파일 업로드
        const fileName = generateFileName(file.originalname);
        const folder = isImage(file.mimetype) ? 'baby-diary/images' : 'baby-diary/videos';
        const resourceType = isImage(file.mimetype) ? 'image' : 'video';
        
        const uploadResult = await uploadToCloudinary(
          optimizedBuffer,
          folder,
          fileName,
          resourceType
        ) as any;

        let thumbnailResult = null;
        
        // 썸네일 업로드 (이미지인 경우만)
        if (thumbnailBuffer) {
          const thumbnailFileName = `thumb_${fileName}`;
          thumbnailResult = await uploadToCloudinary(
            thumbnailBuffer,
            'baby-diary/thumbnails',
            thumbnailFileName,
            'image'
          ) as any;
        }

        return {
          originalName: file.originalname,
          fileName: fileName,
          mimetype: file.mimetype,
          size: file.size,
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          thumbnailUrl: thumbnailResult?.secure_url || null,
          thumbnailPublicId: thumbnailResult?.public_id || null,
          resourceType: resourceType,
        };
      } catch (error) {
        console.error(`파일 업로드 실패 (${file.originalname}):`, error);
        throw new Error(`파일 업로드 실패: ${file.originalname}`);
      }
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.json({
      success: true,
      data: {
        files: uploadedFiles,
        count: uploadedFiles.length,
      },
      message: `${uploadedFiles.length}개의 파일이 성공적으로 업로드되었습니다.`,
    });
  } catch (error: any) {
    console.error('파일 업로드 오류:', error);
    res.status(500).json({
      success: false,
      message: error.message || '파일 업로드 중 오류가 발생했습니다.',
    });
  }
};

export const deleteFile = async (req: AuthRequest, res: Response) => {
  try {
    const { publicId, resourceType = 'image' } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: '삭제할 파일의 public ID가 필요합니다.',
      });
    }

    const deleteResult = await deleteFromCloudinary(publicId, resourceType as 'image' | 'video');

    if (deleteResult.result === 'ok') {
      res.json({
        success: true,
        message: '파일이 성공적으로 삭제되었습니다.',
      });
    } else {
      res.status(400).json({
        success: false,
        message: '파일 삭제에 실패했습니다.',
      });
    }
  } catch (error: any) {
    console.error('파일 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '파일 삭제 중 오류가 발생했습니다.',
    });
  }
};

export const getUploadProgress = async (req: AuthRequest, res: Response) => {
  try {
    // 실제 프로덕션에서는 Redis나 다른 캐시 시스템을 사용하여 진행률을 추적할 수 있습니다.
    res.json({
      success: true,
      data: {
        progress: 100, // 예시
        status: 'completed',
      },
    });
  } catch (error: any) {
    console.error('업로드 진행률 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '업로드 진행률 조회 중 오류가 발생했습니다.',
    });
  }
};