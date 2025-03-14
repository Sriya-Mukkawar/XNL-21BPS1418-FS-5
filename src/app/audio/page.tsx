"use client";

import React from "react";
import { AudioRecorder } from "@/components/AudioRecorder";
import { VideoRecorder } from "@/components/VideoRecorder";
import { ShareModal } from "@/components/ShareModal";

export default function AudioPage(): React.JSX.Element {
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [mediaBlob, setMediaBlob] = React.useState<Blob | null>(null);
  const [mediaFilter, setMediaFilter] = React.useState<string | null>(null);

  const handleShare = async (userId: string) => {
    if (!mediaBlob) return;

    try {
      const formData = new FormData();
      formData.append('file', mediaBlob);
      formData.append('recipientId', userId);
      if (mediaFilter) {
        formData.append('filter', mediaFilter);
      }

      await fetch('/api/messages/media', {
        method: 'POST',
        body: formData,
      });
      setMediaBlob(null);
      setMediaFilter(null);
      setIsShareModalOpen(false);
    } catch (error) {
      console.error('Error sharing media:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 dark:bg-gray-800 light:bg-white">
      <h1 className="mb-6 text-2xl font-bold">Audio Recorder</h1>
      <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 light:bg-white">
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Audio Recording</h2>
          <AudioRecorder
            onShare={(blob: Blob) => {
              setMediaBlob(blob);
              setMediaFilter(null);
              setIsShareModalOpen(true);
            }}
          />
        </div>
        <div>
          <h2 className="mb-4 text-xl font-semibold">Video Recording</h2>
          <VideoRecorder
            onShare={(blob: Blob, filter: string) => {
              setMediaBlob(blob);
              setMediaFilter(filter);
              setIsShareModalOpen(true);
            }}
          />
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShare={handleShare}
      />
    </div>
  );
} 