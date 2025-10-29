import React from 'react';
import type { User } from '../types';
import { Phone, PhoneOff, Video } from 'lucide-react';

interface IncomingCallModalProps {
  caller: User;
  onAccept: () => void;
  onDecline: () => void;
}

const IncomingCallModal: React.FC<IncomingCallModalProps> = ({ caller, onAccept, onDecline }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-dark-secondary rounded-lg p-8 flex flex-col items-center gap-6 shadow-2xl text-white animate-pulse">
        <img src={caller.avatarUrl} alt={caller.name} className="w-24 h-24 rounded-full object-cover ring-4 ring-green-500" />
        <div>
          <h2 className="text-2xl font-bold">{caller.name}</h2>
          <p className="text-center text-dark-text-secondary">Incoming video call...</p>
        </div>
        <div className="flex items-center gap-8">
          <button onClick={onDecline} className="flex flex-col items-center gap-2 text-red-500 hover:text-red-400">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
              <PhoneOff className="w-8 h-8" />
            </div>
            <span>Decline</span>
          </button>
          <button onClick={onAccept} className="flex flex-col items-center gap-2 text-green-500 hover:text-green-400">
             <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <Phone className="w-8 h-8" />
            </div>
            <span>Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
