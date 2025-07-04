import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Calendar } from 'lucide-react';

interface Post {
  id: string;
  content: string;
  mediaUrls: string[];
  mediaType?: 'IMAGE' | 'VIDEO';
  tags: string[];
  createdAt: string;
  author: {
    id: string;
    name: string;
    profileImage?: string;
  };
  family: {
    id: string;
    name: string;
  };
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}

interface PostCardProps {
  post: Post;
  onLike: () => void;
}

// 이미지 Lazy Loading 컴포넌트
const LazyImage: React.FC<{ src: string; alt: string; className?: string }> = ({ 
  src, 
  alt, 
  className = '' 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className}`} ref={imgRef}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      )}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
        </div>
      )}
    </div>
  );
};

const PostCard: React.FC<PostCardProps> = ({ post, onLike }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '방금 전';
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}일 전`;
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment })
      });

      const data = await response.json();
      if (data.success) {
        setComments(prev => [...prev, data.data]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === post.mediaUrls.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? post.mediaUrls.length - 1 : prev - 1
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6 hover:shadow-xl transition-shadow duration-300">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={post.author.profileImage || `https://ui-avatars.com/api/?name=${post.author.name}&background=random`}
              alt={post.author.name}
              className="w-12 h-12 rounded-full border-2 border-gradient-to-r from-purple-500 to-pink-500 p-0.5"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">{post.author.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>
        
        <button className="text-gray-400 hover:text-gray-800 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* 미디어 */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="aspect-square relative overflow-hidden">
            <LazyImage
              src={post.mediaUrls[currentImageIndex]}
              alt={`${post.author.name}의 게시물`}
              className="w-full h-full"
            />
            
            {/* 이미지 네비게이션 */}
            {post.mediaUrls.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 text-gray-800 rounded-full p-2.5 hover:bg-opacity-100 shadow-lg transition-all duration-200 hover:scale-110"
                >
                  ←
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 text-gray-800 rounded-full p-2.5 hover:bg-opacity-100 shadow-lg transition-all duration-200 hover:scale-110"
                >
                  →
                </button>
                
                {/* 이미지 인디케이터 */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {post.mediaUrls.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                        index === currentImageIndex ? 'bg-white shadow-lg' : 'bg-white bg-opacity-60'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="px-5 py-4 border-t border-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={onLike}
              className={`flex items-center space-x-2 group ${
                post.isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
              } transition-all duration-200`}
            >
              <div className="relative">
                <Heart 
                  className={`w-6 h-6 ${post.isLiked ? 'fill-current' : ''} group-hover:scale-110 transition-transform duration-200`} 
                />
                {post.isLiked && (
                  <div className="absolute inset-0 animate-ping">
                    <Heart className="w-6 h-6 fill-current text-red-500 opacity-75" />
                  </div>
                )}
              </div>
              <span className="text-sm font-semibold">{post.likesCount}</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-all duration-200 group"
            >
              <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm font-semibold">{post.commentsCount}</span>
            </button>
            
            <button className="text-gray-600 hover:text-green-500 transition-all duration-200 group">
              <Share2 className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>

      {/* 내용 */}
      <div className="px-5 pb-4">
        <p className="text-gray-900 whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
        
        {/* 태그 */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 댓글 섹션 */}
      {showComments && (
        <div className="border-t border-gray-100 bg-gray-50">
          {/* 댓글 목록 */}
          <div className="px-5 py-4 max-h-60 overflow-y-auto">
            {comments.length === 0 ? (
              <div className="text-center py-6">
                <div className="mb-2">
                  <MessageCircle className="w-8 h-8 text-gray-400 mx-auto" />
                </div>
                <p className="text-gray-500 text-sm">
                  아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <img
                      src={comment.author?.profileImage || `https://ui-avatars.com/api/?name=${comment.author?.name}&background=random`}
                      alt={comment.author?.name}
                      className="w-8 h-8 rounded-full border border-gray-200"
                    />
                    <div className="flex-1">
                      <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                        <p className="font-semibold text-sm text-gray-900 mb-1">
                          {comment.author?.name}
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 ml-4">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* 댓글 작성 */}
          <form onSubmit={handleCommentSubmit} className="px-5 py-4 border-t border-gray-200 bg-white">
            <div className="flex space-x-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors duration-200"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200"
              >
                게시
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;