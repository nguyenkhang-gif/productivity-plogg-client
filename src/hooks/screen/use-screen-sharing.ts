import { useState, useRef, useCallback } from 'react';

function useScreenSharing() {
  const [isSharing, setIsSharing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null); // Chỉ định kiểu rõ ràng
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startScreenSharing = useCallback(async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      setStream(displayStream);
      setIsSharing(true);

      if (videoRef.current) {
        videoRef.current.srcObject = displayStream;
        videoRef.current.play();
      }

      displayStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenSharing();
      });
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  }, []);

  const stopScreenSharing = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsSharing(false);
    }
  }, [stream]);

  return { isSharing, startScreenSharing, stopScreenSharing, videoRef };
}

export default useScreenSharing;
