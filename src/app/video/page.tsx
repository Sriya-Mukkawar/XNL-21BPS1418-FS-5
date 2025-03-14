"use client";

import React from "react";
import { VideoRecorder } from "@/components/VideoRecorder";
import { ShareModal } from "@/components/ShareModal";

export default function VideoPage(): React.JSX.Element {
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [mediaBlob, setMediaBlob] = React.useState<Blob | null>(null);

  const handleShare = async (userId: string) => {
    if (!mediaBlob) return;

    try {
      const formData = new FormData();
      formData.append('file', mediaBlob);
      formData.append('recipientId', userId);

      await fetch('/api/messages/media', {
        method: 'POST',
        body: formData,
      });
      setMediaBlob(null);
      setIsShareModalOpen(false);
    } catch (error) {
      console.error('Error sharing media:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Video Recorder</h1>
      <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <VideoRecorder
          onShare={(blob: Blob) => {
            setMediaBlob(blob);
            setIsShareModalOpen(true);
          }}
        />
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShare={handleShare}
      />
    </div>
  );
} 