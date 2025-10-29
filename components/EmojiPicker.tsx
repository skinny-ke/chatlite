import React from 'react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
  '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
  '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
  '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓',
  '🧐', '😕', '😟', '🙁', '😮', '😯', '😲', '😳', '🥺', '😦',
  '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞',
  '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿',
  '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖',
  '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟',
  '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '👍', '👎', '✊',
  '👊', '🤛', '🤜', '👏', '🙌', '🤲', '🙏', '🤝', '❤️', '💔',
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  return (
    <div className="absolute bottom-14 left-0 bg-light-primary dark:bg-dark-secondary w-72 h-64 p-2 rounded-xl shadow-lg border border-light-accent dark:border-dark-accent overflow-y-auto z-20">
      <div className="grid grid-cols-8 gap-1">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onEmojiSelect(emoji)}
            className="text-2xl p-1 rounded-md hover:bg-light-accent dark:hover:bg-dark-accent transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
