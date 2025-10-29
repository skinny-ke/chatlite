import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { Mic, MicOff, Video, VideoOff, PhoneOff, User as UserIcon } from 'lucide-react';

interface CallViewProps {
  participants: User[];
  callType: 'video' | 'audio';
  onEndCall: () => void;
}

const CallView: React.FC<CallViewProps> = ({ participants, callType, onEndCall }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full">
          {participants.map(p => (
            <div key={p.id} className="relative bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                {isVideoOff ? (
                    <div className="flex flex-col items-center gap-4">
                        <img src={p.avatarUrl} alt={p.name} className="w-32 h-32 rounded-full object-cover"/>
                        <h2 className="text-2xl font-bold">{p.name}</h2>
                    </div>
                ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-400">
                        <VideoOff className="w-24 h-24" />
                        <p className="absolute bottom-4">{p.name}'s video is off</p>
                    </div>
                )}
            </div>
          ))}
           <div className="relative bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
             {/* This would be the user's own video feed */}
             <div className="flex flex-col items-center gap-4">
                <UserIcon className="w-32 h-32 text-gray-500" />
                <h2 className="text-2xl font-bold">You</h2>
            </div>
           </div>
        </div>
      </div>
      <footer className="bg-black/30 p-4 flex flex-col items-center gap-4">
        <p className="text-lg">{formatDuration(callDuration)}</p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setIsMuted(!isMuted)} className="p-3 bg-white/20 rounded-full">
            {isMuted ? <MicOff /> : <Mic />}
          </button>
          {callType === 'video' && (
            <button onClick={() => setIsVideoOff(!isVideoOff)} className="p-3 bg-white/20 rounded-full">
              {isVideoOff ? <VideoOff /> : <Video />}
            </button>
          )}
          <button onClick={onEndCall} className="p-3 bg-red-500 rounded-full">
            <PhoneOff />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default CallView;
