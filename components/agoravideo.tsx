'use client'

import React, { useState, useEffect } from 'react';
import AgoraRTC, {
  AgoraRTCProvider,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRemoteUsers,
  useIsConnected,
  IAgoraRTCError,
} from "agora-rtc-react";
import { ILocalVideoTrack, ILocalAudioTrack, IRemoteVideoTrack, IRemoteAudioTrack } from "agora-rtc-sdk-ng";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

// Custom MediaPlayer component with adjusted types
const MediaPlayer: React.FC<{
  videoTrack?: ILocalVideoTrack | IRemoteVideoTrack | null;
  audioTrack?: ILocalAudioTrack | IRemoteAudioTrack | null;
}> = ({ videoTrack, audioTrack }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!videoTrack) return;
    const container = ref.current;
    if (!container) return;
    videoTrack.play(container);
    return () => {
      videoTrack.stop();
    };
  }, [videoTrack]);

  useEffect(() => {
    if (!audioTrack) return;
    audioTrack.play();
    return () => {
      audioTrack.stop();
    };
  }, [audioTrack]);

  return <div ref={ref} className="w-full h-full"></div>;
};

const AgoraVideoComponent = () => {
  const [appId, setAppId] = useState(process.env.NEXT_PUBLIC_AGORA_APP_ID || "");
  const [channel, setChannel] = useState("");
  const [error, setError] = useState<string>("");
  
  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);
  
  const isConnected = useIsConnected();
  
  const { data: uid, isLoading: isJoining, error: joinError } = useJoin({ appid: appId, channel: channel, token: null }, isConnected);
  
  const { localMicrophoneTrack, error: micError } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack, error: camError } = useLocalCameraTrack(cameraOn);
  const { isLoading: isPublishing, error: publishError } = usePublish([localMicrophoneTrack, localCameraTrack]);
  
  const remoteUsers = useRemoteUsers();

  useEffect(() => {
    if (micError) setError("Microphone error: " + micError.message);
    if (camError) setError("Camera error: " + camError.message);
    if (joinError) setError("Join error: " + joinError.message);
    if (publishError) setError("Publish error: " + publishError.message);
  }, [micError, camError, joinError, publishError]);

  const handleJoin = () => {
    if (appId && channel) {
      client.join(appId, channel, null, null);
    } else {
      setError("App ID and Channel name are required to join.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      
      {!isConnected && (
        <div className="flex flex-col space-y-4 mb-4">
          <input
            className="border rounded px-3 py-2"
            onChange={e => setAppId(e.target.value)}
            placeholder="Your app ID"
            value={appId}
          />
          <input
            className="border rounded px-3 py-2"
            onChange={e => setChannel(e.target.value)}
            placeholder="Your channel Name"
            value={channel}
          />
          <button
            className={`bg-blue-500 text-white font-bold py-2 px-4 rounded ${(!appId || !channel) && 'opacity-50 cursor-not-allowed'}`}
            disabled={!appId || !channel}
            onClick={handleJoin}
          >
            Join Channel
          </button>
        </div>
      )}
      
      {isConnected && (
        <div className="mt-4">
          <h2 className="text-2xl font-bold mb-4">Room: {channel}</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="w-80 h-60 bg-gray-200 relative overflow-hidden rounded">
              {localCameraTrack && (
                <div className="w-full h-full">
                  <MediaPlayer videoTrack={localCameraTrack as unknown as ILocalVideoTrack} audioTrack={undefined} />
                  <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">You</span>
                </div>
              )}
            </div>
            {remoteUsers.map((user) => (
              <div key={user.uid} className="w-80 h-60 bg-gray-200 relative overflow-hidden rounded">
                <div className="w-full h-full">
                  <MediaPlayer 
                    videoTrack={user.videoTrack as IRemoteVideoTrack | undefined} 
                    audioTrack={user.audioTrack as IRemoteAudioTrack | undefined}
                  />
                  <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">User {user.uid}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            <button 
              className={`px-4 py-2 rounded ${micOn ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}
              onClick={() => setMic(prev => !prev)}
            >
              {micOn ? 'Mic On' : 'Mic Off'}
            </button>
            <button 
              className={`px-4 py-2 rounded ${cameraOn ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}
              onClick={() => setCamera(prev => !prev)}
            >
              {cameraOn ? 'Camera On' : 'Camera Off'}
            </button>
            <button
              className="bg-red-500 text-white font-bold py-2 px-4 rounded"
              onClick={() => client.leave()}
            >
              Leave Channel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AgoraVideoWrapper = () => {
  return (
    <AgoraRTCProvider client={client}>
      <AgoraVideoComponent />
    </AgoraRTCProvider>
  );
};

export default AgoraVideoWrapper;