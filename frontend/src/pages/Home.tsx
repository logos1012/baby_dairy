import React, { useState } from 'react';
import Layout from '../components/Layout/Layout';
import PostForm from '../components/Post/PostForm';
import PostList from '../components/Post/PostList';

const Home: React.FC = () => {
  const [showPostForm, setShowPostForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    tags: '',
    author: '',
  });

  const handlePostSubmit = () => {
    setShowPostForm(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setRefreshTrigger(prev => prev + 1);
  };

  const clearFilters = () => {
    setFilters({ search: '', tags: '', author: '' });
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="내용이나 태그로 검색..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                검색
              </button>
            </div>
            
            <div className="flex gap-3">
              <input
                type="text"
                value={filters.tags}
                onChange={(e) => setFilters(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="태그 필터 (쉼표로 구분)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
              <input
                type="text"
                value={filters.author}
                onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
                placeholder="작성자 필터"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
              {(filters.search || filters.tags || filters.author) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
                >
                  초기화
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 게시물 작성 버튼 */}
        <div className="text-center">
          <button
            onClick={() => setShowPostForm(!showPostForm)}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {showPostForm ? '작성 취소' : '새 게시물 작성'}
          </button>
        </div>

        {/* 게시물 작성 폼 */}
        {showPostForm && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">새 게시물 작성</h2>
            <PostForm
              onSubmit={handlePostSubmit}
              onCancel={() => setShowPostForm(false)}
            />
          </div>
        )}

        {/* 게시물 목록 */}
        <PostList
          refreshTrigger={refreshTrigger}
          filters={filters}
          onPostEdit={(post) => {
            // 게시물 편집 모달을 열거나 편집 페이지로 이동
            console.log('Edit post:', post);
          }}
        />
      </div>
    </Layout>
  );
};

export default Home;