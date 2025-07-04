import React, { useState } from 'react';

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

interface FilePreviewProps {
  files: UploadedFile[];
  onRemove?: (file: UploadedFile) => void;
  className?: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  files,
  onRemove,
  className = '',
}) => {
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (mimetype: string) => mimetype.startsWith('image/');
  const isVideo = (mimetype: string) => mimetype.startsWith('video/');

  if (files.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`file-preview ${className}`}>
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          업로드된 파일 ({files.length})
        </h4>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div
              key={file.publicId}
              className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* 미리보기 */}
              <div 
                className="aspect-square cursor-pointer"
                onClick={() => setSelectedFile(file)}
              >
                {isImage(file.mimetype) ? (
                  <img
                    src={file.thumbnailUrl || file.url}
                    alt={file.originalName}
                    className="w-full h-full object-cover"
                  />
                ) : isVideo(file.mimetype) ? (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center relative">
                    <video
                      src={file.url}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* 파일 정보 */}
              <div className="p-2">
                <p className="text-xs font-medium text-gray-900 truncate" title={file.originalName}>
                  {file.originalName}
                </p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>

              {/* 삭제 버튼 */}
              {onRemove && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(file);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* 파일 타입 표시 */}
              <div className="absolute top-2 left-2">
                {isVideo(file.mimetype) && (
                  <span className="px-1 py-0.5 bg-black bg-opacity-50 text-white text-xs rounded">
                    동영상
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 파일 상세 모달 */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">{selectedFile.originalName}</h3>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              {isImage(selectedFile.mimetype) ? (
                <img
                  src={selectedFile.url}
                  alt={selectedFile.originalName}
                  className="max-w-full max-h-96 mx-auto"
                />
              ) : isVideo(selectedFile.mimetype) ? (
                <video
                  src={selectedFile.url}
                  controls
                  className="max-w-full max-h-96 mx-auto"
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">미리보기를 지원하지 않는 파일 형식입니다.</p>
                  <a
                    href={selectedFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-500 underline"
                  >
                    파일 다운로드
                  </a>
                </div>
              )}
            </div>
            
            <div className="px-4 pb-4">
              <div className="text-sm text-gray-500 space-y-1">
                <p>크기: {formatFileSize(selectedFile.size)}</p>
                <p>형식: {selectedFile.mimetype}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilePreview;