import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User, Family, AuthResponse } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  state: AuthState;
  login: (user: User, family: Family | null, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN'; payload: { user: User; family: Family | null; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        family: action.payload.family,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        family: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  family: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = (user: User, family: Family | null, token: string) => {
    localStorage.setItem('token', token);
    dispatch({ type: 'LOGIN', payload: { user, family, token } });
  };

  const logout = async () => {
    try {
      if (state.token) {
        await apiService.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiService.get<AuthResponse>('/auth/me');
      
      if (response.success && response.data) {
        dispatch({ 
          type: 'LOGIN', 
          payload: { 
            user: response.data.user, 
            family: response.data.family,
            token 
          } 
        });
      } else {
        localStorage.removeItem('token');
        setLoading(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ state, login, logout, setLoading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};