"use client";

import React from "react";
import { FaMicrophone, FaStop } from "react-icons/fa";
import { IoSend } from "react-icons/io5";

interface AudioRecorderProps {
  onShare: (blob: Blob) => void;
}

export function AudioRecorder({ onShare }: AudioRecorderProps): React.JSX.Element {
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [recordedChunks, setRecordedChunks] = React.useState<Blob[]>([]);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        setRecordedChunks(chunks);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleShare = () => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: "audio/webm" });
      onShare(blob);
      setRecordedChunks([]);
    }
  };

  return (
    <div className="flex items-center gap-4 p-2">
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
          <FaMicrophone className="h-4 w-4" />
        </button>
      )}
      {recordedChunks.length > 0 && (
        <button
          onClick={handleShare}
          className="rounded-full bg-blue-500 p-3 text-white hover:bg-blue-600"
        >
          <IoSend className="h-4 w-4" />
        </button>
      )}
    </div>
  );
} 