// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApolloClient, gql, useLazyQuery } from '@apollo/client'; // Import useLazyQuery
import { User } from '../types'; // Adjust the path if your types file is in a different location

// Define a simple User type for the frontend context
// This should ideally match your GraphQL User type, excluding sensitive fields
export interface AuthUser extends Omit<User, 'passwordHash' | 'transactions' | 'upiAccounts' | 'cardAccounts' | 'bankAccounts'> {
  // Add any frontend specific derived fields if needed
}


interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean; // For initial loading of token/user
  login: (token: string, userData: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  isAppLoading: boolean; // For initial app splash/loading screen
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define your ME_QUERY
const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      firstName
      lastName
      middleName
      phone
      gender
      dob
      profession
      # Add other fields you want for the user context
    }
  }
`;


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // For checking token on app start
  const [isAppLoading, setIsAppLoading] = useState(true); // For initial app load before routing

  const client = useApolloClient();

  // Use useLazyQuery for fetching user data on demand or after token is loaded
  const [fetchMe, { data: meData, error: meError, loading: meLoading }] = useLazyQuery<{ me: AuthUser }>(ME_QUERY, {
    fetchPolicy: 'network-only', // Always get fresh data after login/token load
    onCompleted: (data) => {
      if (data && data.me) {
        setUser(data.me);
      } else {
        // Token might be invalid or user not found
        logout(); // Clear token and user if 'me' query fails
      }
      setIsLoading(false);
      setIsAppLoading(false);
    },
    onError: (error) => {
      console.error('Error fetching ME:', error.message);
      logout(); // Clear token and user on error
      setIsLoading(false);
      setIsAppLoading(false);
    }
  });

  useEffect(() => {
    const loadAuthData = async () => {
      setIsLoading(true);
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        if (storedToken) {
          setToken(storedToken);
          // If token exists, try to fetch user data
          fetchMe();
        } else {
          setIsLoading(false);
          setIsAppLoading(false);
        }
      } catch (e) {
        console.error('Failed to load auth data from storage', e);
        setIsLoading(false);
        setIsAppLoading(false);
      }
    };
    loadAuthData();
  }, [fetchMe]);


  const login = async (newToken: string, userData: AuthUser) => {
    setIsLoading(true);
    try {
      await AsyncStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(userData); // Set user data directly from login/signup response
      await client.resetStore(); // Reset Apollo cache for fresh data with new auth state
    } catch (e) {
      console.error('Failed to save auth data', e);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
      await client.resetStore(); // Important to clear cache on logout
    } catch (e) {
      console.error('Failed to clear auth data', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, isAppLoading }}>
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