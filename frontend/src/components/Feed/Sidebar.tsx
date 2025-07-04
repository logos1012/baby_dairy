import React, { useState, useEffect } from 'react';
import { Users, Calendar, Heart, MessageCircle, Hash, Crown, UserPlus } from 'lucide-react';

interface SidebarProps {
  userInfo: any;
  posts: any[];
}

const Sidebar: React.FC<SidebarProps> = ({ userInfo, posts }) => {
  const [familyStats, setFamilyStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    memberCount: 1
  });

  const [recentTags, setRecentTags] = useState<{ tag: string; count: number }[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    // 통계 계산
    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum, post) => sum + post.likesCount, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.commentsCount, 0);

    setFamilyStats({
      totalPosts,
      totalLikes,
      totalComments,
      memberCount: 1 // TODO: 실제 가족 구성원 수
    });

    // 태그 집계
    const tagCount: { [key: string]: number } = {};
    posts.forEach(post => {
      if (post.tags) {
        post.tags.forEach((tag: string) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });

    const sortedTags = Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setRecentTags(sortedTags);

    // 최근 활동 (최근 게시물 기준)
    const recentPosts = posts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    setRecentActivity(recentPosts);
  }, [posts]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getTagCloudSize = (count: number, maxCount: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.7) return 'text-lg font-bold';
    if (ratio > 0.4) return 'text-base font-semibold';
    return 'text-sm';
  };

  const maxTagCount = Math.max(...recentTags.map(t => t.count), 1);

  return (
    <div className="space-y-6">
      {/* 가족 정보 카드 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          가족 정보
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">가족명</span>
            <span className="font-medium">{userInfo.family?.name}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">역할</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              userInfo.family?.role === 'ADMIN' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {userInfo.family?.role === 'ADMIN' ? (
                <span className="flex items-center">
                  <Crown className="w-3 h-3 mr-1" />
                  관리자
                </span>
              ) : '구성원'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">초대코드</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
              {userInfo.family?.inviteCode}
            </code>
          </div>
        </div>

        <button className="w-full mt-4 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center">
          <UserPlus className="w-4 h-4 mr-2" />
          가족 초대하기
        </button>
      </div>

      {/* 활동 통계 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          가족 활동
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{familyStats.totalPosts}</div>
            <div className="text-sm text-gray-600">게시물</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{familyStats.totalLikes}</div>
            <div className="text-sm text-gray-600">좋아요</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{familyStats.totalComments}</div>
            <div className="text-sm text-gray-600">댓글</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">{familyStats.memberCount}</div>
            <div className="text-sm text-gray-600">구성원</div>
          </div>
        </div>
      </div>

      {/* 태그 클라우드 */}
      {recentTags.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Hash className="w-5 h-5 mr-2" />
            인기 태그
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {recentTags.map(({ tag, count }) => (
              <span
                key={tag}
                className={`bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 cursor-pointer transition-colors ${getTagCloudSize(count, maxTagCount)}`}
                title={`${count}번 사용됨`}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 최근 활동 */}
      {recentActivity.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
          
          <div className="space-y-3">
            {recentActivity.map((post) => (
              <div key={post.id} className="flex items-start space-x-3">
                <img
                  src={post.author.profileImage || `https://ui-avatars.com/api/?name=${post.author.name}&background=random`}
                  alt={post.author.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">
                    <span className="font-medium">{post.author.name}</span>님이 
                    게시물을 작성했습니다
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
                  {post.content && (
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {post.content.length > 30 
                        ? `${post.content.substring(0, 30)}...` 
                        : post.content
                      }
                    </p>
                  )}
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="flex items-center text-xs text-gray-500">
                      <Heart className="w-3 h-3 mr-1" />
                      {post.likesCount}
                    </span>
                    <span className="flex items-center text-xs text-gray-500">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      {post.commentsCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 추천 기능 */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">💡 추천</h3>
        <p className="text-sm opacity-90 mb-3">
          오늘의 특별한 순간을 기록해보세요!
        </p>
        <div className="space-y-2 text-sm">
          <div>📸 아이의 새로운 표정</div>
          <div>🍼 첫 이유식 도전</div>
          <div>👶 성장 과정 기록</div>
          <div>👨‍👩‍👧‍👦 가족 시간</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;