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
      <iframe
        src="https://iframe.mediadelivery.net/embed/387344/a00c5351-c6ea-408c-970a-e0febe7fcfde?autoplay=true&loop=false&muted=false&preload=true&responsive=true"
        loading="lazy"
        style={{ width: "100%", height: "100vh" }}
        allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
      ></iframe>
    </div>
  );
}
