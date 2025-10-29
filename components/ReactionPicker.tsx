import React from 'react';

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
}

const commonReactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const ReactionPicker: React.FC<ReactionPickerProps> = ({ onSelect }) => {
  return (
    <div className="absolute -top-10 bg-light-primary dark:bg-dark-secondary p-1 rounded-full shadow-lg border border-light-accent dark:border-dark-accent flex items-center gap-1 z-20">
      {commonReactions.map(emoji => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="text-xl p-1 rounded-full hover:bg-light-accent dark:hover:bg-dark-accent transition-transform transform hover:scale-125"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default ReactionPicker;
