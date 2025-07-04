import React, { useState, useEffect } from 'react';
import PostCard from './PostCard';
import { apiService } from '../../services/api';

interface Post {
  id: string;
  content: string;
  mediaUrls: string[];
  mediaType?: 'IMAGE' | 'VIDEO';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  comments: any[];
  _count: {
    likes: number;
    comments: number;
  };
}

interface PostListProps {
  refreshTrigger?: number;
  filters?: {
    tags?: string;
    author?: string;
    search?: string;
  };
  onPostEdit?: (post: Post) => void;
}

const PostList: React.FC<PostListProps> = ({
  refreshTrigger,
  filters,
  onPostEdit,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPosts = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
        ...filters,
      });

      const response = await apiService.get(`/posts?${params}`);

      if (response.success && response.data) {
        const newPosts = response.data.posts;
        
        if (append) {
          setPosts(prev => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }
        
        setHasMore(response.data.pagination.hasNext);
        setPage(pageNum);
      } else {
        setError(response.error || '게시물을 불러오는데 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.message || '게시물을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchPosts(page + 1, true);
    }
  };

  const handlePostDelete = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  const handlePostLike = (postId: string, liked: boolean) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? {
            ...post,
            _count: {
              ...post._count,
              likes: liked ? post._count.likes + 1 : post._count.likes - 1
            }
          }
        : post
    ));
  };

  useEffect(() => {
    fetchPosts(1);
  }, [refreshTrigger, filters]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/3"></div>
              </div>
            </div>
            <div className="space-y-2 mb-3">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
            <div className="h-40 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchPosts(1)}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-900 mb-2">아직 게시물이 없습니다</p>
        <p className="text-gray-500">첫 번째 추억을 기록해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onEdit={onPostEdit}
          onDelete={handlePostDelete}
          onLike={handlePostLike}
        />
      ))}

      {/* 더 보기 버튼 */}
      {hasMore && (
        <div className="text-center py-4">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loadingMore ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                <span>로딩 중...</span>
              </div>
            ) : (
              '더 보기'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PostList;