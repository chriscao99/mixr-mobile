import React, { createContext, useContext, useState, useCallback } from 'react';
import { userProfile as mockProfile, djs } from '@/src/data/mockData';
import { UserProfile } from '@/src/types';

interface UserContextValue {
  profile: UserProfile;
  followedDjIds: string[];
  toggleFollow: (djId: string) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile] = useState(mockProfile);

  // Track followed DJs — initialize from mock data
  const [followedDjIds, setFollowedDjIds] = useState<string[]>(
    () => djs.filter((d) => d.isFollowing).map((d) => d.id)
  );

  const toggleFollow = useCallback((djId: string) => {
    setFollowedDjIds((prev) =>
      prev.includes(djId) ? prev.filter((id) => id !== djId) : [...prev, djId]
    );
  }, []);

  return (
    <UserContext.Provider value={{ profile, followedDjIds, toggleFollow }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUserContext must be used within UserProvider');
  }
  return ctx;
}
