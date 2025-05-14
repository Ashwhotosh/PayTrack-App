// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApolloClient } from '@apollo/client'; // Removed gql and useLazyQuery here, will use generated
// Import generated hook and types
import { useMeLazyQuery, MeQuery } from '@/graphql/generated/graphql'; // Adjust path
import { User } from '../types'; // Adjust the path if your types file is in a different location

export interface AuthUser extends Omit<User, 'passwordHash' | 'transactions' | 'upiAccounts' | 'cardAccounts' | 'bankAccounts'> {
  // avatarUrl?: string | null; // Example: if you add avatar to AuthUser
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, userData: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  isAppLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ME_QUERY is now defined in operations.ts and imported via useMeLazyQuery

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Initialize to false, true only during active operations
  const [isAppLoading, setIsAppLoading] = useState(true); // True until initial token check is complete

  const client = useApolloClient();

  const [fetchMe, { loading: meLoading }] = useMeLazyQuery({ // Removed data and error, handle in callbacks
    fetchPolicy: 'network-only',
    onCompleted: (data) => { // data is typed as MeQuery | undefined from generated hook
      // console.log("AuthContext: fetchMe onCompleted, data:", data);
      if (data?.me) {
        // Map to AuthUser. Ensure ME_QUERY selects all necessary fields for AuthUser.
        const authUserData: AuthUser = {
            id: data.me.id,
            email: data.me.email,
            firstName: data.me.firstName,
            lastName: data.me.lastName,
            middleName: data.me.middleName,
            phone: data.me.phone,
            // Cast Gender if your AuthUser expects a string literal union and GQL gives an enum
            gender: data.me.gender as AuthUser['gender'],
            dob: data.me.dob as string | null, // dob is 'any' in generated if scalar not mapped
            profession: data.me.profession,
            createdAt: data.me.createdAt as string,
            updatedAt: data.me.updatedAt as string,
        };
        setUser(authUserData);
        // console.log("AuthContext: User set from fetchMe:", authUserData.email);
      } else {
        console.log("AuthContext: fetchMe completed but no user data, logging out.");
        // Token might be invalid or user not found.
        // No need to call logout() here if it causes an infinite loop with isLoading.
        // Setting token/user to null and isAppLoading/isLoading to false is enough.
        setToken(null);
        setUser(null);
        AsyncStorage.removeItem('authToken'); // Also clear from storage
      }
      setIsLoading(false); // Ensure this is for the fetchMe operation
      setIsAppLoading(false); // Initial app load sequence is complete
    },
    onError: (error) => {
      console.error('AuthContext: Error fetching ME:', error.message);
      // No need to call logout() here if it causes an infinite loop with isLoading.
      setToken(null);
      setUser(null);
      AsyncStorage.removeItem('authToken');
      setIsLoading(false);
      setIsAppLoading(false); // Initial app load sequence is complete (even if with error)
    }
  });

  useEffect(() => {
    const loadAuthData = async () => {
      // console.log("AuthContext: loadAuthData running...");
      // setIsLoading(true); // isLoading is for login/logout operations, isAppLoading is for this
      setIsAppLoading(true); // Explicitly set at start of this effect
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        // console.log("AuthContext: Stored token from AsyncStorage:", storedToken ? "TOKEN_FOUND" : "NO_TOKEN");
        if (storedToken) {
          setToken(storedToken);
          fetchMe(); // This will eventually set isLoading and isAppLoading to false via its callbacks
        } else {
          // No token, so no user to fetch. App is ready for auth flow.
          setUser(null); // Ensure user is null
          setToken(null); // Ensure token is null
          setIsLoading(false); // Not actively logging in/out
          setIsAppLoading(false); // Initial check complete
          console.log("AuthContext: No stored token, app ready for login.");
        }
      } catch (e) {
        console.error('AuthContext: Failed to load auth data from storage', e);
        setUser(null);
        setToken(null);
        setIsLoading(false);
        setIsAppLoading(false);
      }
    };
    loadAuthData();
  }, [fetchMe]); // fetchMe is stable, this effect runs once on mount


  const login = async (newToken: string, userDataFromLogin: AuthUser) => {
    // console.log('AuthContext: contextLogin CALLED');
    setIsLoading(true);
    try {
      await AsyncStorage.setItem('authToken', newToken);
      // console.log('AuthContext: Token STORED in AsyncStorage');
      setToken(newToken);
      setUser(userDataFromLogin);
      // console.log('AuthContext: Token and User state UPDATED in context. User:', userDataFromLogin?.email);
      await client.resetStore();
      console.log('AuthContext: Apollo client store RESET.');
      setIsAppLoading(false); // <<< CRUCIAL: Indicate app is past initial loading/auth check
    } catch (e) {
      console.error('AuthContext: FAILED to save auth data', e);
      // If login fails here (e.g. AsyncStorage error), ensure states are reset
      setToken(null);
      setUser(null);
      setIsAppLoading(false); // Still, app is no longer "app loading"
    } finally {
      setIsLoading(false);
      console.log('AuthContext: contextLogin FINISHED, isLoading set to false, isAppLoading should be false.');
    }
  };

  const logout = async () => {
    console.log('AuthContext: contextLogout CALLED');
    setIsLoading(true);
    // isAppLoading should probably remain false or be set to true if you want a loading screen during logout's async ops
    // For simplicity, let's ensure it's false as the app is not in its initial loading phase.
    // However, if logout involves async cleanup that should show a global loader, isAppLoading might be set to true.
    // Let's assume for now that isLoading is enough for logout.
    try {
      await AsyncStorage.removeItem('authToken');
      console.log('AuthContext: Token REMOVED from AsyncStorage');
      setToken(null);
      setUser(null);
      console.log('AuthContext: Token and User state CLEARED in context.');
      await client.resetStore();
      console.log('AuthContext: Apollo client store RESET on logout.');
      // setIsAppLoading(false); // Ensure it's false if login previously set it
    } catch (e) {
      console.error('AuthContext: FAILED to clear auth data', e);
    } finally {
      setIsLoading(false);
      console.log('AuthContext: contextLogout FINISHED, isLoading set to false.');
    }
  };

  // Add meLoading to the isLoading check for context consumers
  const combinedIsLoading = isLoading || meLoading;

  return (
    <AuthContext.Provider value={{ user, token, isLoading: combinedIsLoading, login, logout, isAppLoading }}>
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