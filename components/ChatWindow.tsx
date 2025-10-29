import React, { useState, useRef, useEffect, useContext } from 'react';
import type { Chat, User, Message } from '../types';
import { MoreVertical, Phone, Video, Search, Send, Smile, Paperclip, Mic, X, StopCircle } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import ReactionPicker from './ReactionPicker';
import { ThemeContext } from '../contexts/ThemeContext';
import CallView from './CallView';
import IncomingCallModal from './IncomingCallModal';


const MessageBubble: React.FC<{ message: Message; isOwn: boolean; sender?: User; onAddReaction: (messageId: string, emoji: string) => void }> = ({ message, isOwn, sender, onAddReaction }) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  
  const bubbleClasses = isOwn
    ? 'bg-blue text-white self-end rounded-l-xl rounded-br-xl'
    : 'bg-light-primary dark:bg-dark-secondary self-start rounded-r-xl rounded-bl-xl';

  const renderContent = () => {
    if (message.type === 'image') {
      return <img src={message.content} alt="sent" className="rounded-lg max-w-xs cursor-pointer" />;
    }
     if (message.type === 'audio') {
      return <audio src={message.content} controls className="max-w-xs" />;
    }
    if (message.type === 'call-log') {
        const icon = message.callInfo?.type === 'missed' ? 'PhoneMissed' : message.callInfo?.type === 'outgoing' ? 'PhoneForwarded' : 'PhoneIncoming';
        const color = message.callInfo?.type === 'missed' ? 'text-red-500' : 'text-green-500';
        return <div className="flex items-center gap-2"><span className={`${color}`}>{icon}</span> Call {message.callInfo?.duration}</div>
    }

    if (message.groundingMetadata?.groundingChunks?.length) {
        return (
            <div>
                <p>{message.content}</p>
                <div className="mt-2 text-xs">
                    <p className="font-bold mb-1">Sources:</p>
                    <div className="flex flex-col gap-1">
                        {message.groundingMetadata.groundingChunks.map((chunk, index) =>
                            chunk.web && (
                                <a
                                    key={index}
                                    href={chunk.web.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-300 hover:underline truncate"
                                    title={chunk.web.title}
                                >
                                    {index + 1}. {chunk.web.title}
                                </a>
                            )
                        )}
                    </div>
                </div>
            </div>
        );
    }
    
    return <p>{message.content}</p>;
  };

  return (
    <div className={`flex items-end gap-2 my-1 group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isOwn && sender && <img src={sender.avatarUrl} alt={sender.name} className="w-6 h-6 rounded-full self-end" />}
      <div className={`relative max-w-md lg:max-w-xl p-3 ${bubbleClasses}`}>
        {renderContent()}
        <div className="flex gap-1 mt-1">
          {message.reactions.map((r, i) => (
            <span key={i} className="text-xs bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded-full">{r.emoji}</span>
          ))}
        </div>
        <div 
          className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-light-secondary dark:bg-dark-accent cursor-pointer"
          style={isOwn ? {left: '-2rem'} : {right: '-2rem'}}
          onClick={() => setShowReactionPicker(prev => !prev)}
        >
          <Smile className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
          {showReactionPicker && (
            <ReactionPicker onSelect={(emoji) => {
              onAddReaction(message.id, emoji);
              setShowReactionPicker(false);
            }} />
          )}
        </div>
      </div>
    </div>
  );
};


const ChatWindow: React.FC<{
  chat: Chat;
  currentUser: User;
  onSendMessage: (content: string, chatId: string, type: 'text' | 'image' | 'audio') => void;
  onUpdateMessage: (chatId: string, messageId: string, updatedFields: Partial<Message>) => void;
}> = ({ chat, currentUser, onSendMessage, onUpdateMessage }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const themeContext = useContext(ThemeContext);
  const [isCalling, setIsCalling] = useState(false);
  const [callType, setCallType] = useState<'video' | 'audio' | null>(null);
  const [incomingCall, setIncomingCall] = useState<User | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);
  
  // Simulate an incoming call for demo purposes
  useEffect(() => {
    if (chat.name === "Alice") {
      const timer = setTimeout(() => {
        const alice = chat.participants.find(p => p.id !== currentUser.id);
        if (alice) setIncomingCall(alice);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [chat.id, chat.name, chat.participants, currentUser.id]);
  
  useEffect(() => {
    // Cleanup stream on component unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);


  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message, chat.id, 'text');
      setMessage('');
      setShowEmojiPicker(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newImageUrl = URL.createObjectURL(file);
      onSendMessage(newImageUrl, chat.id, 'image');
    }
  };
  
  const handleAddReaction = (messageId: string, emoji: string) => {
    const targetMessage = chat.messages.find(m => m.id === messageId);
    if (!targetMessage) return;

    const existingReaction = targetMessage.reactions.find(r => r.emoji === emoji && r.userId === currentUser.id);
    let newReactions;

    if (existingReaction) {
      newReactions = targetMessage.reactions.filter(r => !(r.emoji === emoji && r.userId === currentUser.id));
    } else {
      newReactions = [...targetMessage.reactions, { emoji, userId: currentUser.id }];
    }
    
    onUpdateMessage(chat.id, messageId, { reactions: newReactions });
  };
  
   const handleStartRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support audio recording.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        onSendMessage(audioUrl, chat.id, 'audio');
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      alert('Microphone access was denied. Please allow microphone access in your browser settings.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const startCall = (type: 'video' | 'audio') => {
    setCallType(type);
    setIsCalling(true);
  };
  
  const endCall = () => {
    setIsCalling(false);
    setCallType(null);
  };
  
  const otherParticipants = chat.participants.filter(p => p.id !== currentUser.id);

  if (isCalling && callType) {
    return <CallView participants={otherParticipants} callType={callType} onEndCall={endCall} />;
  }
  

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between p-3 border-b border-light-accent dark:border-dark-accent flex-shrink-0">
        <div className="flex items-center gap-4">
          <img src={chat.avatarUrl} alt={chat.name} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h2 className="font-bold">{chat.name}</h2>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                {chat.type === 'ai' ? 'AI Assistant' : chat.type === 'group' ? `${chat.participants.length} members` : 'online'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            { chat.type !== 'ai' && <>
                <button className="p-2 rounded-full hover:bg-light-accent dark:hover:bg-dark-accent" onClick={() => startCall('audio')}>
                    <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-full hover:bg-light-accent dark:hover:bg-dark-accent" onClick={() => startCall('video')}>
                    <Video className="w-5 h-5" />
                </button>
            </>
            }
          <button className="p-2 rounded-full hover:bg-light-accent dark:hover:bg-dark-accent">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-light-accent dark:hover:bg-dark-accent">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-light-accent/50 dark:bg-dark-accent/20">
        <div className="flex flex-col">
            {chat.messages.map(msg => (
                <MessageBubble 
                    key={msg.id}
                    message={msg}
                    isOwn={msg.senderId === currentUser.id}
                    sender={chat.participants.find(p => p.id === msg.senderId)}
                    onAddReaction={handleAddReaction}
                />
            ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <footer className="p-3 border-t border-light-accent dark:border-dark-accent flex-shrink-0">
        <div className="relative flex items-center gap-2">
          {showEmojiPicker && <EmojiPicker onEmojiSelect={(emoji) => setMessage(prev => prev + emoji)} />}
          <button className="p-2 rounded-full hover:bg-light-accent dark:hover:bg-dark-accent" onClick={() => setShowEmojiPicker(prev => !prev)}>
            <Smile className="w-6 h-6" />
          </button>
          <button className="p-2 rounded-full hover:bg-light-accent dark:hover:bg-dark-accent" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="w-6 h-6" />
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </button>
          <input
            type="text"
            placeholder="Type a message"
            className="flex-1 bg-light-secondary dark:bg-dark-accent rounded-full px-4 py-2 focus:outline-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          {message ? (
            <button className="p-2 rounded-full bg-blue text-white" onClick={handleSendMessage} aria-label="Send message">
                <Send className="w-6 h-6" />
            </button>
          ) : isRecording ? (
            <button className="p-2 rounded-full bg-red-500 text-white animate-pulse" onClick={handleStopRecording} aria-label="Stop recording">
                <StopCircle className="w-6 h-6" />
            </button>
           ) : (
            <button className="p-2 rounded-full hover:bg-light-accent dark:hover:bg-dark-accent" onClick={handleStartRecording} aria-label="Record voice message">
                <Mic className="w-6 h-6" />
            </button>
          )}
        </div>
      </footer>
      {incomingCall && (
        <IncomingCallModal 
            caller={incomingCall}
            onAccept={() => {
                startCall('video');
                setIncomingCall(null);
            }}
            onDecline={() => setIncomingCall(null)}
        />
      )}
    </div>
  );
};

export default ChatWindow;