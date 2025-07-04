import { useState, useCallback } from 'react';
import { apiService } from '../services/api';

interface UploadedFile {
  originalName: string;
  fileName: string;
  mimetype: string;
  size: number;
  url: string;
  publicId: string;
  thumbnailUrl?: string;
  thumbnailPublicId?: string;
  resourceType: 'image' | 'video';
}

interface UseFileUploadReturn {
  uploadFiles: (files: File[]) => Promise<UploadedFile[]>;
  deleteFile: (publicId: string, resourceType?: 'image' | 'video') => Promise<void>;
  uploading: boolean;
  progress: number;
  error: string | null;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = useCallback(async (files: File[]): Promise<UploadedFile[]> => {
    if (files.length === 0) {
      throw new Error('업로드할 파일이 없습니다.');
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await apiService.post<{ files: UploadedFile[]; count: number }>(
        '/upload/files',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(percentCompleted);
            }
          },
        }
      );

      if (response.success && response.data) {
        return response.data.files;
      } else {
        throw new Error(response.error || '파일 업로드에 실패했습니다.');
      }
    } catch (err: any) {
      const errorMessage = err.message || '파일 업로드 중 오류가 발생했습니다.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, []);

  const deleteFile = useCallback(async (publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> => {
    setError(null);

    try {
      const response = await apiService.delete('/upload/files', {
        data: { publicId, resourceType },
      });

      if (!response.success) {
        throw new Error(response.error || '파일 삭제에 실패했습니다.');
      }
    } catch (err: any) {
      const errorMessage = err.message || '파일 삭제 중 오류가 발생했습니다.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    uploadFiles,
    deleteFile,
    uploading,
    progress,
    error,
  };
};