import React, { useState } from 'react';
import FileUpload from '../Upload/FileUpload';
import { apiService } from '../../services/api';
import { UploadedFile } from '../../types';

interface PostFormProps {
  onSubmit?: (post: any) => void;
  onCancel?: () => void;
  initialData?: {
    content: string;
    mediaUrls: string[];
    tags: string[];
  };
  isEditing?: boolean;
}

const PostForm: React.FC<PostFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState({
    content: initialData?.content || '',
    tags: initialData?.tags || [],
  });
  const [mediaUrls, setMediaUrls] = useState<string[]>(initialData?.mediaUrls || []);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      content: e.target.value,
    }));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim();
      
      if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag],
        }));
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleFileUpload = (uploadedFiles: UploadedFile[]) => {
    const urls = uploadedFiles.map(file => file.url);
    setMediaUrls(prev => [...prev, ...urls]);
  };

  const handleFileUploadError = (error: string) => {
    setError(error);
  };

  const removeMedia = (urlToRemove: string) => {
    setMediaUrls(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const postData = {
        content: formData.content,
        mediaUrls,
        tags: formData.tags,
      };

      const response = await apiService.post('/posts', postData);

      if (response.success) {
        onSubmit?.(response.data);
        
        // 폼 초기화
        if (!isEditing) {
          setFormData({ content: '', tags: [] });
          setMediaUrls([]);
          setTagInput('');
        }
      } else {
        setError(response.error || '게시물 작성에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.message || '게시물 작성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 내용 입력 */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          내용 *
        </label>
        <textarea
          id="content"
          rows={4}
          value={formData.content}
          onChange={handleContentChange}
          placeholder="오늘의 소중한 순간을 기록해보세요..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          maxLength={2000}
        />
        <div className="text-right text-xs text-gray-500 mt-1">
          {formData.content.length}/2000
        </div>
      </div>

      {/* 파일 업로드 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          사진/동영상
        </label>
        <FileUpload
          onUploadComplete={handleFileUpload}
          onUploadError={handleFileUploadError}
          maxFiles={5}
          className="border border-gray-200 rounded-lg p-4"
        />
      </div>

      {/* 업로드된 미디어 미리보기 */}
      {mediaUrls.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            선택된 미디어 ({mediaUrls.length})
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {mediaUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`미디어 ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeMedia(url)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 태그 입력 */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
          태그
        </label>
        <input
          type="text"
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="태그를 입력하고 Enter 또는 쉼표를 눌러주세요"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          maxLength={20}
        />
        <div className="text-xs text-gray-500 mt-1">
          Enter 또는 쉼표로 태그를 추가할 수 있습니다 (최대 10개)
        </div>
        
        {/* 태그 목록 */}
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-indigo-600 hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 버튼 */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || !formData.content.trim()}
          className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? '작성 중...' : isEditing ? '수정하기' : '게시하기'}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
        )}
      </div>
    </form>
  );
};

export default PostForm;