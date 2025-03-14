"use client";

import React from "react";
import { FaVideo, FaStop } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { MdReplay } from "react-icons/md";

interface VideoRecorderProps {
  onShare: (blob: Blob, filter: string) => void;
}

export function VideoRecorder({ onShare }: VideoRecorderProps): React.JSX.Element {
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [recordedChunks, setRecordedChunks] = React.useState<Blob[]>([]);
  const [showPreview, setShowPreview] = React.useState(false);
  const [videoFilter, setVideoFilter] = React.useState("none");
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const filters = [
    { name: "None", value: "none" },
    { name: "Grayscale", value: "grayscale(100%)" },
    { name: "Sepia", value: "sepia(100%)" },
    { name: "Blur", value: "blur(2px)" },
    { name: "Brightness", value: "brightness(150%)" },
  ];

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  React.useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: true 
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        setRecordedChunks(chunks);
        setShowPreview(true);
      };

      // Request data every second to ensure we capture everything
      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const handleRetake = () => {
    setShowPreview(false);
    setRecordedChunks([]);
    void handleStartRecording();
  };

  const handleShare = () => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { 
        type: "video/webm;codecs=vp9,opus"
      });
      onShare(blob, videoFilter);
      setRecordedChunks([]);
      setShowPreview(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 rounded-lg bg-white dark:bg-gray-800">
      {!showPreview && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-w-[400px] rounded-lg"
          style={{ filter: videoFilter }}
        />
      )}
      
      {showPreview && recordedChunks.length > 0 && (
        <video
          autoPlay
          playsInline
          controls
          className="w-full max-w-[400px] rounded-lg"
          style={{ filter: videoFilter }}
          src={URL.createObjectURL(new Blob(recordedChunks, { type: "video/webm;codecs=vp9,opus" }))}
        />
      )}

      {!showPreview && (
        <div className="flex items-center gap-4">
          <select
            value={videoFilter}
            onChange={(e) => setVideoFilter(e.target.value)}
            className="rounded-lg bg-gray-100 px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
          >
            {filters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.name}
              </option>
            ))}
          </select>

          {isRecording ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-white">
                <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
                <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
              </div>
              <button
                onClick={handleStopRecording}
                className="rounded-full bg-gray-200 p-3 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                <FaStop className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartRecording}
              className="rounded-full bg-gray-200 p-3 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <FaVideo className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {showPreview && (
        <div className="flex items-center gap-4">
          <button
            onClick={handleRetake}
            className="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <MdReplay className="h-4 w-4" />
            <span>Retake</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            <IoSend className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>
      )}
    </div>
  );
} 