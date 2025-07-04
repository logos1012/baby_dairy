import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { state, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              우리 아기 다이어리
            </h1>
            {state.family && (
              <p className="text-sm text-gray-500">
                {state.family.name} ({state.family.role === 'ADMIN' ? '관리자' : '멤버'})
              </p>
            )}
          </div>
          
          {state.isAuthenticated && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  {state.user?.name}님
                </p>
                {state.family && (
                  <p className="text-xs text-gray-500">
                    초대코드: {state.family.inviteCode}
                  </p>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-200 hover:bg-red-50"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;