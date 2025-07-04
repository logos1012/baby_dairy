import React, { useState, useRef } from 'react';
import { Upload, X, ImageIcon, Smile } from 'lucide-react';

interface PostFormProps {
  onPostCreated: () => void;
  onCancel: () => void;
}

const PostForm: React.FC<PostFormProps> = ({ onPostCreated, onCancel }) => {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const newFiles = Array.from(selectedFiles).filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      return (isImage || isVideo) && isValidSize;
    });
    
    setFiles(prev => [...prev, ...newFiles].slice(0, 5)); // 최대 5개
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !tags.includes(tag) && tags.length < 10) {
        setTags(prev => [...prev, tag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      let mediaUrls: string[] = [];

      // 파일 업로드
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach(file => {
          formData.append('files', file);
        });

        const uploadResponse = await fetch('http://localhost:3001/api/upload/files', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const uploadData = await uploadResponse.json();
        if (uploadData.success) {
          mediaUrls = uploadData.data.files.map((file: any) => file.url);
        } else {
          throw new Error('파일 업로드 실패');
        }
      }

      // 게시물 생성
      const postResponse = await fetch('http://localhost:3001/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          mediaUrls,
          tags
        })
      });

      const postData = await postResponse.json();
      if (postData.success) {
        onPostCreated();
        // 폼 초기화
        setContent('');
        setFiles([]);
        setTags([]);
        setTagInput('');
      } else {
        throw new Error(postData.message || '게시물 작성 실패');
      }
    } catch (error) {
      console.error('Post creation failed:', error);
      alert(error instanceof Error ? error.message : '게시물 작성 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">새 게시물 작성</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-800 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 내용 입력 */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="오늘의 특별한 순간을 공유해보세요... ✨"
            className="w-full h-40 p-4 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors duration-200 text-gray-900 placeholder-gray-500"
          />
        </div>

        {/* 파일 업로드 영역 */}
        <div
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
            dragOver
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 scale-105'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-white" />
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 font-semibold text-lg transition-colors duration-200"
              >
                사진 또는 동영상 선택
              </button>
              <p className="text-sm text-gray-600 mt-2">또는 여기에 드래그하세요 📸</p>
            </div>
            <p className="text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1 inline-block">
              최대 5개 파일, 각 10MB 이하
            </p>
          </div>
        </div>

        {/* 선택된 파일 미리보기 */}
        {files.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`미리보기 ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
                      <span className="text-sm text-purple-600 font-medium">동영상 🎬</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110 shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 태그 입력 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              태그 추가 🏷️
            </span>
            <span className="text-gray-500 ml-2 text-xs">(엔터 또는 쉼표로 구분)</span>
          </label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagAdd}
            placeholder="예: 첫걸음, 생일, 놀이"
            className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors duration-200"
          />
          
          {/* 태그 목록 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm px-4 py-2 rounded-full flex items-center shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-white hover:text-gray-200 transition-colors duration-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-all duration-200 hover:scale-105 font-medium"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={(!content.trim() && files.length === 0) || uploading}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 font-semibold"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>게시 중...</span>
              </>
            ) : (
              <>
                <span>게시하기</span>
                <span>✨</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;