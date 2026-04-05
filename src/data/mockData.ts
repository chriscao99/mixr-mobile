import { DJ, FeedItem, UserProfile, Achievement, Genre } from '../types';

export const genres: Genre[] = [
  { id: '1', name: 'House', color: '#8B5CF6', gradientColors: ['#8B5CF6', '#6366F1'] },
  { id: '2', name: 'Techno', color: '#14B8A6', gradientColors: ['#14B8A6', '#0D9488'] },
  { id: '3', name: 'Hip-Hop', color: '#F59E0B', gradientColors: ['#F59E0B', '#D97706'] },
  { id: '4', name: 'R&B', color: '#EC4899', gradientColors: ['#EC4899', '#DB2777'] },
  { id: '5', name: 'Afrobeats', color: '#10B981', gradientColors: ['#10B981', '#059669'] },
];

export const djs: DJ[] = [
  {
    id: '1', name: 'DJ Nova', location: 'Los Angeles, CA',
    genres: ['House', 'Techno', 'Deep House'],
    imageUrl: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=400',
    followers: 2400, shows: 127, rating: 4.8, isFollowing: false,
  },
  {
    id: '2', name: 'DJ Aurora', location: 'New York, NY',
    genres: ['House', 'Deep House'],
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    followers: 3100, shows: 89, rating: 4.9, isFollowing: true,
  },
  {
    id: '3', name: 'DJ Kova', location: 'Miami, FL',
    genres: ['Techno', 'House'],
    imageUrl: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400',
    followers: 1800, shows: 64, rating: 4.6, isFollowing: true,
  },
  {
    id: '4', name: 'Luna Beats', location: 'Chicago, IL',
    genres: ['Hip-Hop', 'R&B'],
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400',
    followers: 950, shows: 42, rating: 4.7, isFollowing: false,
  },
  {
    id: '5', name: 'Zara Beats', location: 'Atlanta, GA',
    genres: ['Techno', 'House'],
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
    followers: 720, shows: 31, rating: 4.5, isFollowing: false,
  },
  {
    id: '6', name: 'MC Flow', location: 'Houston, TX',
    genres: ['Hip-Hop', 'Afrobeats'],
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    followers: 1100, shows: 55, rating: 4.4, isFollowing: false,
  },
];

export const feedItems: FeedItem[] = [
  {
    id: '1', dj: djs[1], type: 'new_mix',
    title: 'New mixtape — Midnight Frequencies',
    subtitle: 'Deep house vibes for late nights',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
    likes: 2400, comments: 38, isLiked: true, timestamp: '2h ago',
  },
  {
    id: '2', dj: djs[2], type: 'upcoming_show',
    title: 'Playing Warehouse tonight',
    subtitle: 'Doors at 10pm · Downtown LA',
    imageUrl: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=600',
    likes: 1800, comments: 67, isLiked: false, timestamp: '5h ago',
  },
  {
    id: '3', dj: djs[3], type: 'collab',
    title: 'Collab with @MaxTempo dropping Friday',
    subtitle: 'Something special coming your way',
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
    likes: 340, comments: 15, isLiked: false, timestamp: '8h ago',
  },
];

export const userProfile: UserProfile = {
  id: '1', name: 'John Doe', handle: '@johndoe',
  initials: 'JD', level: 5, levelTitle: 'Explorer',
  streak: 7, following: 12, liked: 48,
  achievements: [
    { id: '1', name: 'First Follow', description: 'Follow your first DJ', icon: 'star', earned: true },
    { id: '2', name: 'Mix Master', description: 'Like 10 mixes', icon: 'music', earned: true, progress: '10/10' },
    { id: '3', name: 'Night Owl', description: 'Browse at 2am', icon: 'moon', earned: false, progress: '3 more' },
  ],
};
