"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";

export default function VideoPage() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleNextPage = () => {
    router.push("/timer");
  };

  return (
    <div className="w-full h-screen bg-black relative">
      <iframe
        ref={iframeRef}
        src="https://iframe.mediadelivery.net/embed/387344/a00c5351-c6ea-408c-970a-e0febe7fcfde?autoplay=false&loop=false&muted=false&preload=true&responsive=true&enableapi=true"
        loading="lazy"
        style={{ width: "100%", height: "100vh" }}
        allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
      ></iframe>

      <button
        onClick={handleNextPage}
        style={{
          position: "absolute",
          zIndex: 50,
          top: "1rem",
          right: "2rem",
          backgroundColor: "rgba(147, 51, 234, 0.9)",
          color: "white",
          fontWeight: 500,
          padding: "0.5rem 1rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          transition: "background-color 0.2s",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(4px)",
          border: "none",
          cursor: "pointer",
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.backgroundColor = "rgba(126, 34, 206, 0.9)")
        }
        onMouseOut={(e) =>
          (e.currentTarget.style.backgroundColor = "rgba(147, 51, 234, 0.9)")
        }
      >
        Next
      </button>
    </div>
  );
}
