import React, { useState } from 'react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author: User;
}

interface Post {
  id: string;
  content: string;
  mediaUrls: string[];
  mediaType?: 'IMAGE' | 'VIDEO';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  author: User;
  comments: Comment[];
  _count: {
    likes: number;
    comments: number;
  };
}

interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onLike?: (postId: string, liked: boolean) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onEdit,
  onDelete,
  onLike,
}) => {
  const { state } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);

  const isAuthor = state.user?.id === post.author.id;

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLike = async () => {
    try {
      const response = await apiService.post(`/posts/${post.id}/like`);
      
      if (response.success) {
        const newLiked = response.data.liked;
        setLiked(newLiked);
        setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
        onLike?.(post.id, newLiked);
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('게시물을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await apiService.delete(`/posts/${post.id}`);
      
      if (response.success) {
        onDelete?.(post.id);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      // 댓글 API는 별도로 구현 필요
      // const response = await apiService.post(`/posts/${post.id}/comments`, {
      //   content: commentText
      // });
      
      setCommentText('');
    } catch (error) {
      console.error('Comment error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              {post.author.profileImage ? (
                <img
                  src={post.author.profileImage}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-gray-600">
                  {post.author.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{post.author.name}</p>
              <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
            </div>
          </div>
          
          {isAuthor && (
            <div className="flex space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(post)}
                  className="text-gray-400 hover:text-gray-600"
                  title="수정"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-600"
                title="삭제"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 내용 */}
      <div className="p-4">
        <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
        
        {/* 태그 */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 미디어 */}
      {post.mediaUrls.length > 0 && (
        <div className="grid grid-cols-1 gap-1">
          {post.mediaUrls.map((url, index) => (
            <div key={index} className="relative">
              {post.mediaType === 'VIDEO' ? (
                <video
                  src={url}
                  controls
                  className="w-full max-h-96 object-cover"
                />
              ) : (
                <img
                  src={url}
                  alt={`미디어 ${index + 1}`}
                  className="w-full max-h-96 object-cover"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 ${
                liked ? 'text-red-500' : 'text-gray-500'
              } hover:text-red-500`}
            >
              <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm font-medium">{likeCount}</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm font-medium">{post._count.comments}</span>
            </button>
          </div>
        </div>

        {/* 댓글 섹션 */}
        {showComments && (
          <div className="mt-4 space-y-3">
            {/* 댓글 목록 */}
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-gray-600">
                    {comment.author.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <p className="font-medium text-sm text-gray-900">{comment.author.name}</p>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(comment.createdAt)}</p>
                </div>
              </div>
            ))}

            {/* 댓글 작성 */}
            <form onSubmit={handleComment} className="flex space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-gray-600">
                  {state.user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={!commentText.trim() || loading}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                게시
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;