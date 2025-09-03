import { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Monitor,
  MonitorOff,
  MessageSquare,
  Maximize,
  Minimize,
  CameraOff,
  Loader,
  X
} from 'lucide-react';
import Peer from 'simple-peer';
import toast from 'react-hot-toast';

const VideoChat = ({ friend, onClose }) => {
  const [localStream, setLocalStream] = useState(null);
  const [, setRemoteStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [callState, setCallState] = useState('idle'); // idle, calling, connected, ended
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callTimerRef = useRef(null);
  const containerRef = useRef(null);

  // Initialize media stream
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
        toast.error('Failed to access camera/microphone');
      }
    };
    
    initMedia();
    
    return () => {
      // Cleanup
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Initialize peer connection
  const initiateCall = (initiator = true) => {
    if (!localStream) {
      toast.error('Media not ready');
      return;
    }

    const p = new Peer({
      initiator,
      trickle: false,
      stream: localStream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    });

    p.on('signal', (signal) => {
      // Send signal to friend via WebSocket or API
      sendSignalToFriend(signal);
    });

    p.on('stream', (stream) => {
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      setCallState('connected');
      startCallTimer();
    });

    p.on('error', (err) => {
      console.error('Peer error:', err);
      toast.error('Connection error');
      endCall();
    });

    p.on('close', () => {
      endCall();
    });

    setPeer(p);
    setCallState(initiator ? 'calling' : 'connecting');
  };

  // Send signal to friend (implement with your backend)
  const sendSignalToFriend = (signal) => {
    // This should send the signal to your friend via WebSocket or API
    console.log('Sending signal to friend:', signal);
    // Example: socket.emit('video-signal', { to: friend.id, signal });
  };

  // Receive signal from friend (currently unused but may be needed for WebRTC)
  // const receiveSignal = (signal) => {
  //   if (peer) {
  //     peer.signal(signal);
  //   }
  // };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  // Share screen
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
        
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peer?.peerConnection?.getSenders().find(
          s => s.track && s.track.kind === 'video'
        );
        
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
        
        videoTrack.onended = () => {
          toggleScreenShare();
        };
        
        setIsScreenSharing(true);
      } catch (error) {
        console.error('Error sharing screen:', error);
        toast.error('Failed to share screen');
      }
    } else {
      // Stop screen sharing
      const videoTrack = localStream.getVideoTracks()[0];
      const sender = peer?.peerConnection?.getSenders().find(
        s => s.track && s.track.kind === 'video'
      );
      
      if (sender && videoTrack) {
        sender.replaceTrack(videoTrack);
      }
      
      setIsScreenSharing(false);
    }
  };

  // Start call timer
  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  // End call
  const endCall = () => {
    if (peer) {
      peer.destroy();
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    setCallState('ended');
    setPeer(null);
    setRemoteStream(null);
    
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Send chat message
  const sendMessage = () => {
    if (currentMessage.trim() && peer) {
      const message = {
        text: currentMessage,
        sender: 'me',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, message]);
      // Send message via data channel
      if (peer.send) {
        peer.send(JSON.stringify(message));
      }
      setCurrentMessage('');
    }
  };

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 rounded-full">
                <img src={friend?.profilePic} alt={friend?.fullName} />
              </div>
            </div>
            <div>
              <h3 className="font-semibold">{friend?.fullName}</h3>
              <p className="text-sm opacity-80">
                {callState === 'connected' ? formatDuration(callDuration) : 
                 callState === 'calling' ? 'Calling...' :
                 callState === 'connecting' ? 'Connecting...' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="btn btn-ghost btn-circle text-white"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-circle text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative">
        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
        />
        
        {/* Local Video */}
        <div className="absolute bottom-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden shadow-2xl">
          <video
            ref={localVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
          {!isVideoOn && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <CameraOff className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Call State Overlay */}
        {callState === 'calling' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <Loader className="w-12 h-12 animate-spin mx-auto mb-4" />
              <p className="text-xl">Calling {friend?.fullName}...</p>
            </div>
          </div>
        )}

        {callState === 'ended' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <PhoneOff className="w-12 h-12 mx-auto mb-4" />
              <p className="text-xl">Call Ended</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleAudio}
            className={`btn btn-circle ${isAudioOn ? 'btn-ghost text-white' : 'btn-error'}`}
          >
            {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>
          
          <button
            onClick={toggleVideo}
            className={`btn btn-circle ${isVideoOn ? 'btn-ghost text-white' : 'btn-error'}`}
          >
            {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>
          
          <button
            onClick={endCall}
            className="btn btn-error btn-circle btn-lg"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
          
          <button
            onClick={toggleScreenShare}
            className={`btn btn-circle ${isScreenSharing ? 'btn-primary' : 'btn-ghost text-white'}`}
          >
            {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
          </button>
          
          <button
            onClick={() => setShowChat(!showChat)}
            className="btn btn-ghost btn-circle text-white relative"
          >
            <MessageSquare className="w-6 h-6" />
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 badge badge-error badge-xs">
                {messages.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Chat Panel */}
      {showChat && (
        <div className="absolute top-20 right-4 bottom-28 w-80 bg-base-100 rounded-lg shadow-2xl flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Chat</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat ${msg.sender === 'me' ? 'chat-end' : 'chat-start'}`}>
                <div className="chat-bubble">
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="input input-bordered flex-1"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage} className="btn btn-primary">
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start Call Button (if not connected) */}
      {callState === 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={() => initiateCall(true)}
            className="btn btn-primary btn-lg gap-2"
          >
            <Phone className="w-6 h-6" />
            Start Call
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoChat;