import React, { useState, useContext, useRef } from 'react';
// Fix: Corrected import path for types. The error was due to types.ts being empty.
import type { Chat, User } from '../types';
import { ThemeContext } from '../contexts/ThemeContext';
import { Sun, Moon, Search, MessageSquarePlus, Users, Bot, Camera, Edit2, Plus } from 'lucide-react';

interface SidebarProps {
  chats: Chat[];
  activeChatId?: string | null;
  setActiveChat: (chat: Chat) => void;
  currentUser: User;
  onUpdateCurrentUser: (updatedFields: Partial<User>) => void;
  onNewChat: () => void;
}

const getHighlightedText = (text: string, highlight: string) => {
  if (!highlight.trim()) {
    return <>{text}</>;
  }
  const lowerText = text.toLowerCase();
  const lowerHighlight = highlight.toLowerCase();
  const index = lowerText.indexOf(lowerHighlight);

  if (index === -1) {
    return <>{text}</>;
  }

  const before = text.substring(0, index);
  const match = text.substring(index, index + highlight.length);
  const after = text.substring(index + highlight.length);

  return (
    <>
      {before}
      <span className="font-bold text-blue">{match}</span>
      {after}
    </>
  );
};

const formatTimestamp = (ts: number | undefined): string => {
    if (!ts) return '';
    const date = new Date(ts);
    const now = new Date();
    
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (date.getTime() >= startOfToday.getTime()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};


const Sidebar: React.FC<SidebarProps> = ({ chats, activeChatId, setActiveChat, currentUser, onUpdateCurrentUser, onNewChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const themeContext = useContext(ThemeContext);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [statusDraft, setStatusDraft] = useState(currentUser.statusMessage || '');


  const toggleTheme = () => {
    if (themeContext) {
      themeContext.setTheme(themeContext.theme === 'light' ? 'dark' : 'light');
    }
  };
  
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newAvatarUrl = URL.createObjectURL(file);
      onUpdateCurrentUser({ avatarUrl: newAvatarUrl });
    }
  };
  
  const handleStatusUpdate = () => {
    onUpdateCurrentUser({ statusMessage: statusDraft });
    setIsEditingStatus(false);
  };
  
  const handleStatusKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleStatusUpdate();
    }
    if (e.key === 'Escape') {
      setStatusDraft(currentUser.statusMessage || '');
      setIsEditingStatus(false);
    }
  };

  const sortedChats = [...chats].sort((a, b) => (b.lastMessage?.timestamp ?? 0) - (a.lastMessage?.timestamp ?? 0));

  const filteredChats = sortedChats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <aside className="w-full md:w-80 lg:w-96 flex flex-col bg-light-primary dark:bg-dark-secondary border-r border-light-accent dark:border-dark-accent h-screen">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-light-accent dark:border-dark-accent">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative group flex-shrink-0">
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full cursor-pointer object-cover" onClick={handleAvatarClick} />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handleAvatarClick}>
              <Camera className="w-5 h-5 text-white" />
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-xl font-bold truncate">{currentUser.name}</h1>
             {isEditingStatus ? (
              <input 
                type="text"
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value)}
                onBlur={handleStatusUpdate}
                onKeyDown={handleStatusKeyDown}
                className="w-full bg-transparent text-sm text-light-text-secondary dark:text-dark-text-secondary focus:outline-none border-b border-blue animate-pulse"
                autoFocus
              />
             ) : (
                <p 
                  className="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate cursor-pointer flex items-center gap-1.5 group/status"
                  onClick={() => setIsEditingStatus(true)}
                >
                  <span className="truncate">{currentUser.statusMessage || "No status"}</span>
                  <Edit2 className="w-3 h-3 opacity-0 group-hover/status:opacity-50 transition-opacity" />
                </p>
             )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
           <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-light-accent dark:hover:bg-dark-accent transition-colors"
            aria-label="Toggle theme"
          >
            {themeContext?.theme === 'light' ? 
              <Moon className="w-5 h-5" /> : 
              <Sun className="w-5 h-5" />
            }
          </button>
           <button className="p-2 rounded-full hover:bg-light-accent dark:hover:bg-dark-accent transition-colors">
            <MessageSquarePlus className="w-5 h-5" />
          </button>
           <button 
             onClick={onNewChat}
             className="p-2 rounded-full hover:bg-light-accent dark:hover:bg-dark-accent transition-colors"
             aria-label="New Chat"
           >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="p-3 border-b border-light-accent dark:border-dark-accent">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
          <input
            type="text"
            placeholder="Search chats"
            className="w-full bg-light-secondary dark:bg-dark-accent rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length > 0 ? filteredChats.map(chat => {
          const isTyping = chat.typingParticipants && chat.typingParticipants.length > 0;
          return (
          <div
            key={chat.id}
            className={`flex items-center p-3 cursor-pointer transition-colors ${
              activeChatId === chat.id
                ? 'bg-blue/10 dark:bg-blue/20'
                : 'hover:bg-light-accent dark:hover:bg-dark-accent'
            }`}
            onClick={() => setActiveChat(chat)}
          >
            <div className="relative">
              <img src={chat.avatarUrl} alt={chat.name} className="w-12 h-12 rounded-full object-cover" />
              {chat.type === 'private' && (
                <span className="absolute bottom-0 right-0 block h-3 w-3 bg-green rounded-full border-2 border-light-primary dark:border-dark-secondary"></span>
              )}
            </div>
            <div className="ml-4 flex-1 overflow-hidden">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold truncate">
                  {getHighlightedText(chat.name, searchTerm)}
                </h3>
                <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0 ml-2">
                  {formatTimestamp(chat.lastMessage?.timestamp)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                {isTyping ? (
                  <p className="text-blue truncate italic">
                    typing...
                  </p>
                ) : (
                  <p className="text-light-text-secondary dark:text-dark-text-secondary truncate">
                    {chat.lastMessage?.content.startsWith('blob:') ? `Sent a file` : chat.lastMessage?.content}
                  </p>
                )}
                {chat.unreadCount > 0 && (
                  <span className="bg-blue text-white text-xs font-bold rounded-full px-2 py-0.5">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}) : (
          <div className="text-center p-6 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <p>No chats found.</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
