export interface DJ {
  id: string;
  name: string;
  location: string;
  genres: string[];
  imageUrl: string;
  followers: number;
  shows: number;
  rating: number;
  isFollowing: boolean;
}

export interface FeedItem {
  id: string;
  dj: DJ;
  type: 'new_mix' | 'upcoming_show' | 'collab' | 'announcement';
  title: string;
  subtitle: string;
  imageUrl: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  initials: string;
  level: number;
  levelTitle: string;
  streak: number;
  following: number;
  liked: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: string;
}

export interface Genre {
  id: string;
  name: string;
  color: string;
  gradientColors: [string, string];
}
