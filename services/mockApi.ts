import type { User, Chat } from '../types';

export const currentUser: User = {
  id: 'user-1',
  name: 'You',
  avatarUrl: 'https://i.pravatar.cc/150?u=user-1',
  statusMessage: 'Beep boop, I am a human.',
};

export const users: User[] = [
  currentUser,
  {
    id: 'user-2',
    name: 'Alice',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-2',
    statusMessage: 'Exploring the world!',
  },
  {
    id: 'user-3',
    name: 'Bob',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-3',
    statusMessage: 'Coding something cool.',
  },
  {
    id: 'gemini-ai',
    name: 'Gemini AI',
    avatarUrl: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_180f24a682a7a5a8d296.gif',
    statusMessage: 'Your friendly AI assistant.',
    isAi: true,
  },
  {
    id: 'user-4',
    name: 'Charlie',
    avatarUrl: 'https://i.pravatar.cc/150?u=user-4',
    statusMessage: 'On a coffee break.',
  },
];

const initialChats: Chat[] = [
  {
    id: 'chat-1',
    name: 'Alice',
    type: 'private',
    participants: [currentUser, users.find(u => u.id === 'user-2')!],
    avatarUrl: users.find(u => u.id === 'user-2')!.avatarUrl,
    messages: [
      { id: 'msg-1', senderId: 'user-2', content: 'Hey there! How are you?', timestamp: Date.now() - 1000 * 60 * 60 * 2, reactions: [], type: 'text' },
      { id: 'msg-2', senderId: 'user-1', content: 'Doing great, Alice! Just setting up this chat app. You?', timestamp: Date.now() - 1000 * 60 * 60 * 1, reactions: [{emoji: '👍', userId: 'user-2'}], type: 'text' },
    ],
    lastMessage: { id: 'msg-2', senderId: 'user-1', content: 'Doing great, Alice! Just setting up this chat app. You?', timestamp: Date.now() - 1000 * 60 * 60 * 1, reactions: [{emoji: '👍', userId: 'user-2'}], type: 'text' },
    unreadCount: 0,
  },
  {
    id: 'chat-2',
    name: 'Gemini AI',
    type: 'ai',
    participants: [currentUser, users.find(u => u.id === 'gemini-ai')!],
    avatarUrl: users.find(u => u.id === 'gemini-ai')!.avatarUrl,
    messages: [
       { id: 'msg-3', senderId: 'gemini-ai', content: 'Hello! I am Gemini. Ask me anything about recent events or search for information!', timestamp: Date.now() - 1000 * 60 * 5, reactions: [], type: 'text' }
    ],
    lastMessage: { id: 'msg-3', senderId: 'gemini-ai', content: 'Hello! I am Gemini. Ask me anything about recent events or search for information!', timestamp: Date.now() - 1000 * 60 * 5, reactions: [], type: 'text' },
    unreadCount: 1,
  },
  {
    id: 'chat-3',
    name: 'Project Team',
    type: 'group',
    participants: [currentUser, users.find(u => u.id === 'user-2')!, users.find(u => u.id === 'user-3')!],
    avatarUrl: 'https://i.pravatar.cc/150?u=group-1',
    messages: [
      { id: 'msg-4', senderId: 'user-3', content: 'Hey team, how\'s the project going?', timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, reactions: [], type: 'text' }
    ],
    lastMessage: { id: 'msg-4', senderId: 'user-3', content: 'Hey team, how\'s the project going?', timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, reactions: [], type: 'text' },
    unreadCount: 3,
  },
];


export const getMockData = async () => {
  return {
    users: users.filter(u => u.id !== currentUser.id), // Exclude current user from the list of other users
    chats: initialChats,
    currentUser: currentUser,
  };
};
