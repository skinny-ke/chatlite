import React, { useState } from 'react';
import type { Message, User } from '../types';
import { Smile } from 'lucide-react';
import ReactionPicker from './ReactionPicker';

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

export default MessageBubble;