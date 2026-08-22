import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, Trash2, Download, Square } from 'lucide-react';
import toast from 'react-hot-toast';

const AudioRecorder = ({ onRecordingComplete, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const audio = audioRef.current;
    audio.onended = () => setIsPlaying(false);
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      clearInterval(timerRef.current);
      audio.pause();
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        audioRef.current.src = url;
        stream.getTracks().forEach((t) => t.stop());
        if (onRecordingComplete) onRecordingComplete(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        toast.error('Microphone access denied. Allow microphone in browser settings.');
      } else {
        toast.error('Could not start recording. Check your microphone.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const clearRecording = () => {
    audioRef.current.pause();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
    audioRef.current.src = '';
  };

  const downloadRecording = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `practice-${new Date().toISOString().slice(0, 19)}.webm`;
    a.click();
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (!navigator.mediaDevices?.getUserMedia) return null;

  return (
    <div className="flex items-center gap-1.5">
      {!audioBlob ? (
        <>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            className={`btn btn-circle btn-sm ${
              isRecording ? 'btn-error' : 'btn-ghost'
            } ${isRecording ? 'animate-pulse' : ''}`}
            title={isRecording ? 'Stop recording' : 'Record your voice'}
          >
            {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4 text-error" />}
          </button>
          {isRecording && (
            <span className="text-xs font-mono text-error tabular-nums">{fmt(recordingTime)}</span>
          )}
        </>
      ) : (
        <>
          <button
            onClick={togglePlayback}
            className="btn btn-circle btn-sm btn-success"
            title={isPlaying ? 'Pause' : 'Play your recording'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <span className="text-xs opacity-50 font-mono tabular-nums">{fmt(recordingTime)}</span>
          <button
            onClick={downloadRecording}
            className="btn btn-ghost btn-xs"
            title="Download recording"
          >
            <Download className="w-3 h-3" />
          </button>
          <button
            onClick={clearRecording}
            className="btn btn-ghost btn-xs text-error"
            title="Delete recording"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </>
      )}
    </div>
  );
};

export default AudioRecorder;
