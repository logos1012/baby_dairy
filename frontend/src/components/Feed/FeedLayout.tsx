import React, { useState, useEffect, useRef } from 'react';
import PostCard from './PostCard';
import PostForm from './PostForm';
import Sidebar from './Sidebar';

interface Post {
  id: string;
  content: string;
  mediaUrls: string[];
  mediaType?: 'IMAGE' | 'VIDEO';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    profileImage?: string;
  };
  familyId: string;
  family: {
    id: string;
    name: string;
  };
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}

interface FeedLayoutProps {
  userInfo: any;
  onLogout?: () => void;
}

const FeedLayout: React.FC<FeedLayoutProps> = ({ userInfo, onLogout }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [filterTag, setFilterTag] = useState<string>('');
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastPostElementRef = useRef<HTMLDivElement | null>(null);

  // 무한 스크롤 구현
  useEffect(() => {
    if (loading) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1.0 }
    );
    
    if (lastPostElementRef.current) {
      observerRef.current.observe(lastPostElementRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore]);

  // 게시물 로드
  const loadPosts = async (pageNum: number, isReset: boolean = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
        ...(filterTag && { tags: filterTag }),
        ...(sortBy === 'popular' && { sort: 'likes' })
      });

      const response = await fetch(`http://localhost:3001/api/posts?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        const newPosts = data.data.posts.map((post: any) => ({
          ...post,
          mediaUrls: typeof post.mediaUrls === 'string' ? JSON.parse(post.mediaUrls) : post.mediaUrls,
          tags: typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags,
          likesCount: post._count?.likes || 0,
          commentsCount: post._count?.comments || 0,
          isLiked: false // TODO: 실제 좋아요 상태 확인
        }));

        if (isReset) {
          setPosts(newPosts);
        } else {
          setPosts(prev => [...prev, ...newPosts]);
        }
        
        setHasMore(data.data.pagination.hasNext);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    loadPosts(1, true);
  }, [sortBy, filterTag]);

  // 페이지 증가시 로드
  useEffect(() => {
    if (page > 1) {
      loadPosts(page);
    }
  }, [page]);

  const handlePostCreated = () => {
    setShowPostForm(false);
    setPage(1);
    loadPosts(1, true);
  };

  const handleLike = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                isLiked: data.data.liked,
                likesCount: post.likesCount + (data.data.liked ? 1 : -1)
              }
            : post
        ));
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                베이비 다이어리 👶
              </h1>
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {userInfo.family?.name}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPostForm(!showPostForm)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-2"
              >
                <span>+</span>
                <span>새 게시물</span>
                <span>✨</span>
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-white rounded-full px-4 py-2 shadow-sm">
                  <img
                    src={userInfo.user?.profileImage || `https://ui-avatars.com/api/?name=${userInfo.user?.name}&background=random`}
                    alt={userInfo.user?.name}
                    className="w-8 h-8 rounded-full border-2 border-gray-200"
                  />
                  <span className="text-sm text-gray-700 font-medium">{userInfo.user?.name}</span>
                </div>
                
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="text-sm text-gray-500 hover:text-red-500 transition-colors duration-200 px-3 py-2 rounded-full hover:bg-red-50"
                  >
                    로그아웃
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 메인 피드 */}
          <div className="lg:col-span-3">
            {/* 게시물 작성 폼 */}
            {showPostForm && (
              <div className="mb-6">
                <PostForm
                  onPostCreated={handlePostCreated}
                  onCancel={() => setShowPostForm(false)}
                />
              </div>
            )}

            {/* 필터 및 정렬 */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3">
                    <label className="text-sm font-semibold text-gray-700 flex items-center">
                      <span className="mr-2">🔄</span>
                      정렬:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'latest' | 'popular')}
                      className="border border-gray-300 rounded-full px-4 py-2 text-sm bg-white hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="latest">최신순</option>
                      <option value="popular">인기순</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <label className="text-sm font-semibold text-gray-700 flex items-center">
                      <span className="mr-2">🏷️</span>
                      태그:
                    </label>
                    <input
                      type="text"
                      value={filterTag}
                      onChange={(e) => setFilterTag(e.target.value)}
                      placeholder="태그로 필터링"
                      className="border border-gray-300 rounded-full px-4 py-2 text-sm w-40 bg-white hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full font-medium">
                  📊 {posts.length}개의 게시물
                </div>
              </div>
            </div>

            {/* 게시물 목록 */}
            <div className="space-y-8">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  ref={index === posts.length - 1 ? lastPostElementRef : null}
                >
                  <PostCard
                    post={post}
                    onLike={() => handleLike(post.id)}
                  />
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-center py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="text-gray-600 font-medium">게시물을 불러오는 중...</p>
                  </div>
                </div>
              )}
              
              {!hasMore && posts.length > 0 && (
                <div className="text-center py-12">
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-gray-200">
                    <div className="text-6xl mb-4">🎉</div>
                    <div className="text-gray-600 text-lg font-medium">
                      모든 게시물을 확인했습니다
                    </div>
                    <div className="text-gray-500 text-sm mt-2">
                      새로운 추억을 만들어보세요!
                    </div>
                  </div>
                </div>
              )}
              
              {posts.length === 0 && !loading && (
                <div className="text-center py-16">
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-12 border border-gray-200">
                    <div className="text-8xl mb-6">📝</div>
                    <div className="text-gray-600 text-2xl font-semibold mb-4">
                      아직 게시물이 없습니다
                    </div>
                    <div className="text-gray-500 text-lg mb-8">
                      첫 번째 소중한 추억을 남겨보세요!
                    </div>
                    <button
                      onClick={() => setShowPostForm(true)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-2 mx-auto"
                    >
                      <span>✨</span>
                      <span>첫 게시물 작성하기</span>
                      <span>🚀</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 사이드바 */}
          <div className="lg:col-span-1">
            <Sidebar userInfo={userInfo} posts={posts} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedLayout;