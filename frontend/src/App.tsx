import React, { useState } from 'react';
import FeedLayout from './components/Feed/FeedLayout';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { email, password, isLogin });
    
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await fetch(`http://localhost:3001/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          ...(isLogin ? {} : { name: email.split('@')[0] })
        }),
      });
      
      const data = await response.json();
      console.log('Response:', data);
      
      if (data.success) {
        // 토큰 저장
        if (data.data?.token) {
          localStorage.setItem('token', data.data.token);
        }
        
        // 사용자 정보 저장
        setUserInfo(data.data);
        setIsLoggedIn(true);
        
        // 성공 메시지
        alert(`${isLogin ? '로그인' : '회원가입'} 성공!`);
      } else {
        alert(`오류: ${data.message || data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버 연결 오류');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserInfo(null);
    setEmail('');
    setPassword('');
  };

  // 로그인된 상태의 홈 화면 - 인스타그램 스타일 피드
  if (isLoggedIn && userInfo) {
    return <FeedLayout userInfo={userInfo} onLogout={handleLogout} />;
  }

  // 로그인 화면
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          베이비 다이어리
        </h1>
        
        <div className="mb-4">
          <button
            onClick={() => setIsLogin(true)}
            className={`mr-2 px-4 py-2 rounded ${
              isLogin ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            로그인
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`px-4 py-2 rounded ${
              !isLogin ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLogin ? '로그인' : '회원가입'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>서버 상태 확인:</p>
          <p className="text-green-600">✅ 프론트엔드: http://localhost:3000</p>
          <p className="text-green-600">✅ 백엔드: http://localhost:3001</p>
        </div>
      </div>
    </div>
  );
}

export default App;