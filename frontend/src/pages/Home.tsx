import React from 'react';
import Layout from '../components/Layout/Layout';

const Home: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            우리 아기 다이어리
          </h1>
          <p className="text-gray-600">
            소중한 순간들을 기록하고 공유하세요
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">최근 게시물</h2>
          <div className="text-gray-500 text-center py-8">
            아직 게시물이 없습니다. 첫 번째 추억을 기록해보세요!
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;