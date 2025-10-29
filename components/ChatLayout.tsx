import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import NewChatModal from './NewChatModal';
import { getMockData } from '../services/mockApi';
import { getGeminiResponse } from '../services/geminiService';
import type { Chat, User, Message } from '../types';

const ChatLayout: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { users, chats, currentUser } = await getMockData();
      setUsers(users);
      setChats(chats);
      setCurrentUser(currentUser);
      // Set an initial active chat
      if (chats.length > 0) {
        setActiveChat(chats[0]);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleSetActiveChat = (chat: Chat) => {
    setActiveChat(chat);
    // Mark messages as read
    setChats(prevChats => prevChats.map(c => 
      c.id === chat.id ? { ...c, unreadCount: 0 } : c
    ));
  };
  
  const handleUpdateCurrentUser = (updatedFields: Partial<User>) => {
    if (currentUser) {
        setCurrentUser({ ...currentUser, ...updatedFields });
    }
  };

  const handleNewChat = () => {
    setIsNewChatModalOpen(true);
  };
  
  const handleCreateChat = (selectedUserIds: string[]) => {
    if (!currentUser) return;
  
    const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));
    const allParticipants = [currentUser, ...selectedUsers];

    // Check if a chat with these participants already exists
    const existingChat = chats.find(chat => {
      if (chat.participants.length !== allParticipants.length) return false;
      const chatParticipantIds = chat.participants.map(p => p.id).sort();
      const newChatParticipantIds = allParticipants.map(p => p.id).sort();
      return chatParticipantIds.every((id, index) => id === newChatParticipantIds[index]);
    });

    if (existingChat) {
      setActiveChat(existingChat);
      setIsNewChatModalOpen(false);
      return;
    }

    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      type: allParticipants.length > 2 ? 'group' : 'private',
      name: allParticipants.length > 2 ? 'New Group' : selectedUsers[0].name,
      avatarUrl: allParticipants.length > 2 ? `https://i.pravatar.cc/150?u=group-${Date.now()}` : selectedUsers[0].avatarUrl,
      participants: allParticipants,
      messages: [],
      unreadCount: 0,
    };
    
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat);
    setIsNewChatModalOpen(false);
  };
  

  const handleSendMessage = useCallback(async (content: string, chatId: string, type: 'text' | 'image' | 'audio' = 'text') => {
    if (!currentUser) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      content,
      timestamp: Date.now(),
      reactions: [],
      type,
    };

    let aiResponse: { text: string; groundingMetadata?: any } | null = null;
    const targetChat = chats.find(c => c.id === chatId);
    const isAiChat = targetChat?.type === 'ai';

    if (isAiChat && type === 'text') {
        // Show user message immediately
        setChats(prev => prev.map(c => 
            c.id === chatId ? { ...c, messages: [...c.messages, newMessage], lastMessage: newMessage } : c
        ));
        
        // Get AI response
        aiResponse = await getGeminiResponse(content);
        
        const aiMessage: Message = {
            id: `msg-${Date.now()}-ai`,
            senderId: 'gemini-ai',
            content: aiResponse.text,
            timestamp: Date.now(),
            reactions: [],
            type: 'text',
            groundingMetadata: aiResponse.groundingMetadata,
        };
        
        // Add AI message
        setChats(prev => prev.map(c => 
            c.id === chatId ? { ...c, messages: [...c.messages, aiMessage], lastMessage: aiMessage } : c
        ));
    } else {
         setChats(prev => prev.map(c => 
            c.id === chatId ? { ...c, messages: [...c.messages, newMessage], lastMessage: newMessage } : c
        ));
    }

  }, [currentUser, chats]);
  
  const handleUpdateMessage = (chatId: string, messageId: string, updatedFields: Partial<Message>) => {
    setChats(prev => prev.map(chat => {
      if (chat.id !== chatId) return chat;
      
      const updatedMessages = chat.messages.map(msg => 
        msg.id === messageId ? { ...msg, ...updatedFields } : msg
      );
      
      return { ...chat, messages: updatedMessages };
    }));
  };

  if (isLoading || !currentUser) {
    return <div className="flex items-center justify-center h-screen bg-light-primary dark:bg-dark-primary">Loading...</div>;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
        <Sidebar 
          chats={chats}
          activeChatId={activeChat?.id}
          setActiveChat={handleSetActiveChat}
          currentUser={currentUser}
          onUpdateCurrentUser={handleUpdateCurrentUser}
          onNewChat={handleNewChat}
        />
        <main className="flex-1 flex flex-col bg-light-secondary dark:bg-dark-primary">
          {activeChat ? (
            <ChatWindow 
                key={activeChat.id}
                chat={activeChat}
                currentUser={currentUser}
                onSendMessage={handleSendMessage}
                onUpdateMessage={handleUpdateMessage}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-light-text-secondary dark:text-dark-text-secondary">Select a chat to start messaging</p>
            </div>
          )}
        </main>
        <NewChatModal 
          isOpen={isNewChatModalOpen}
          onClose={() => setIsNewChatModalOpen(false)}
          users={users}
          onCreateChat={handleCreateChat}
        />
    </div>
  );
};

export default ChatLayout;