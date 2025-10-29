import React, { useState, useMemo } from 'react';
// Fix: Corrected import path for types. The error was due to types.ts being empty.
import type { User } from '../types';
import { X, Search } from 'lucide-react';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onCreateChat: (selectedUserIds: string[]) => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose, users, onCreateChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const filteredUsers = useMemo(() =>
    users.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [users, searchTerm]
  );

  if (!isOpen) {
    return null;
  }

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };
  
  const handleCreateClick = () => {
    if (selectedUserIds.length > 0) {
      onCreateChat(selectedUserIds);
      // Reset state for next time
      setSearchTerm('');
      setSelectedUserIds([]);
    }
  };
  
  const buttonText = selectedUserIds.length > 1 ? 'Create Group' : 'Start Chat';

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-light-primary dark:bg-dark-secondary rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh] transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-light-accent dark:border-dark-accent">
          <h2 className="text-lg font-bold">New Chat</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-light-accent dark:hover:bg-dark-accent"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="p-4 border-b border-light-accent dark:border-dark-accent">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
            <input
              type="text"
              placeholder="Search users"
              className="w-full bg-light-secondary dark:bg-dark-accent rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {filteredUsers.map(user => (
            <div 
              key={user.id} 
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-light-accent dark:hover:bg-dark-accent cursor-pointer"
              onClick={() => handleToggleUser(user.id)}
            >
              <input
                type="checkbox"
                checked={selectedUserIds.includes(user.id)}
                onChange={() => handleToggleUser(user.id)}
                className="form-checkbox h-5 w-5 rounded text-blue focus:ring-blue/50 cursor-pointer"
              />
              <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate">{user.statusMessage || 'Available'}</p>
              </div>
            </div>
          ))}
        </div>
        
        <footer className="p-4 border-t border-light-accent dark:border-dark-accent">
          <button
            onClick={handleCreateClick}
            disabled={selectedUserIds.length === 0}
            className="w-full bg-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-dark transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {buttonText} ({selectedUserIds.length})
          </button>
        </footer>
      </div>
    </div>
  );
};

export default NewChatModal;
