import { useRef, useState, useEffect, useCallback } from 'react';
import { X, SwitchCamera, Circle } from 'lucide-react';

interface CameraProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export function Camera({ onCapture, onClose }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [ready, setReady] = useState(false);

  const startStream = useCallback(async (facing: 'user' | 'environment') => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setReady(true);
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    startStream(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode, startStream]);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'camera.jpg', { type: 'image/jpeg' });
      onCapture(file);
    }, 'image/jpeg', 0.95);
  }, [onCapture]);

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    setReady(false);
  }, []);

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col rounded-2xl overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
      />

      {/* Top bar */}
      <div className="relative z-10 flex justify-between items-center p-3">
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <button
          onClick={switchCamera}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white/80 hover:text-white transition-colors"
        >
          <SwitchCamera className="w-5 h-5" />
        </button>
      </div>

      {/* Capture button */}
      <div className="relative z-10 flex-1 flex items-end justify-center pb-6">
        <button
          onClick={handleCapture}
          disabled={!ready}
          className="w-16 h-16 rounded-full border-[3px] border-white flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
        >
          <Circle className="w-12 h-12 text-white fill-white" />
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
