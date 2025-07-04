import React, { useState, useRef, useCallback } from 'react';
import { apiService } from '../../services/api';

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

interface FileWithPreview extends File {
  preview?: string;
  id?: string;
}

interface FileUploadProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onUploadError,
  maxFiles = 5,
  acceptedTypes = ['image/*', 'video/*'],
  className = '',
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 유효성 검사
  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (file.size > maxSize) {
      return '파일 크기는 10MB를 초과할 수 없습니다.';
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/mov',
      'video/avi',
      'video/mkv',
    ];

    if (!allowedTypes.includes(file.type)) {
      return '지원하지 않는 파일 형식입니다.';
    }

    return null;
  };

  // 파일 미리보기 생성
  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        video.onloadeddata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx?.drawImage(video, 0, 0);
          resolve(canvas.toDataURL());
        };

        video.src = URL.createObjectURL(file);
      } else {
        resolve('');
      }
    });
  };

  // 파일 추가
  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    
    if (files.length + fileArray.length > maxFiles) {
      onUploadError?.(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
      return;
    }

    const validFiles: FileWithPreview[] = [];
    
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        onUploadError?.(error);
        continue;
      }

      const fileWithPreview = file as FileWithPreview;
      fileWithPreview.id = Math.random().toString(36).substring(7);
      fileWithPreview.preview = await createPreview(file);
      
      validFiles.push(fileWithPreview);
    }

    setFiles(prev => [...prev, ...validFiles]);
  }, [files.length, maxFiles, onUploadError]);

  // 파일 제거
  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // 드래그 이벤트 핸들러
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  // 파일 선택
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  };

  // 파일 업로드
  const uploadFiles = async () => {
    if (files.length === 0) {
      onUploadError?.('업로드할 파일을 선택해주세요.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await apiService.post<{ files: UploadedFile[]; count: number }>('/upload/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress({ general: progress });
          }
        },
      });

      if (response.success && response.data) {
        onUploadComplete?.(response.data.files);
        setFiles([]);
        setUploadProgress({});
      } else {
        onUploadError?.(response.error || '파일 업로드에 실패했습니다.');
      }
    } catch (error: any) {
      onUploadError?.(error.message || '파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`file-upload ${className}`}>
      {/* 드래그앤드롭 영역 */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">
              파일을 여기로 드래그하거나{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                클릭하여 선택
              </button>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              이미지, 동영상 파일 (최대 {maxFiles}개, 각 10MB 이하)
            </p>
          </div>
        </div>
      </div>

      {/* 선택된 파일 목록 */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-900">선택된 파일 ({files.length})</h4>
          
          <div className="grid grid-cols-1 gap-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {/* 미리보기 */}
                {file.preview && (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                
                {/* 파일 정보 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                
                {/* 제거 버튼 */}
                <button
                  type="button"
                  onClick={() => removeFile(file.id!)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 업로드 진행률 */}
      {uploading && uploadProgress.general !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>업로드 중...</span>
            <span>{uploadProgress.general}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress.general}%` }}
            />
          </div>
        </div>
      )}

      {/* 업로드 버튼 */}
      {files.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={uploadFiles}
            disabled={uploading}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? '업로드 중...' : `${files.length}개 파일 업로드`}
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;