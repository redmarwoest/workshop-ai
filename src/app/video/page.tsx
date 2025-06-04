"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function VideoPage() {
  const router = useRouter();

  const handleVideoEnd = () => {
    router.push("/timer");
  };

  return (
    <div className="w-full h-screen bg-black">
      <video
        style={{ width: "100%", height: "100vh" }}
        controls
        muted={false}
        onEnded={handleVideoEnd}
      >
        <source src="/video-example.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
