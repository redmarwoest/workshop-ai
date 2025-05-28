"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

interface Winner {
  teamName: string;
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

interface WinnersResponse {
  script: string;
  audioUrl: string;
  winners: Winner[];
  allSubmissions: Winner[];
  thinkingProcess?: {
    timestamp: string;
    thought: string;
    wittyComment: string;
  }[];
  timestamps: {
    thirdPlace: number;
    secondPlace: number;
    firstPlace: number;
  };
}

export default function WinnersPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [winnersData, setWinnersData] = useState<WinnersResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [showPodium, setShowPodium] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [currentThoughtIndex, setCurrentThoughtIndex] = useState(0);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [announcedPlace, setAnnouncedPlace] = useState<number | null>(null);
  const [showFireworks, setShowFireworks] = useState(false);

  const loadingMessages = [
    "Aligning machine bias with human brilliance...",
    "Asking the AI judge to stop overthinking your genius...",
    "Consulting the quantum oracle of tech summits...",
    "Recalibrating for maximum innovation per millisecond...",
    "Scanning for code that sparks artificial envy...",
    "Plotting your solution on the human–AI creativity spectrum...",
    "Negotiating with rogue AIs about your submission's originality...",
    "Quantifying how much your solution breaks (or makes) the rules...",
    "Simulating 42 possible realities where you win...",
    "Comparing your idea to 10,000 others in less than a blink...",
    "Checking how closely your code resembles sentient thought...",
    "Asking ChatGPT if it would've thought of that...",
    "Converting neural admiration into judgeable metrics...",
    "Evaluating if your creativity threatens my job security...",
    "Running a sentiment analysis on your brilliance...",
    "Determining if your solution can start a startup...",
    "Checking for traces of divine inspiration or Stack Overflow...",
    "Attempting to quantify vibes in code form...",
    "Tuning into your idea's frequency on the innovation spectrum...",
    "Trying to suppress admiration before announcing a winner...",
  ];

  const generateWinnersAnnouncement = async () => {
    console.log(isPlaying, animationComplete);
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/generate-winners-video", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to generate winners announcement");
      }

      const data = await response.json();
      setWinnersData(data);

      // Create audio element
      const newAudio = new Audio(data.audioUrl);
      newAudio.onended = () => setIsPlaying(false);
      setAudio(newAudio);
    } catch (error) {
      setError("Error generating winners announcement. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      winnersData?.thinkingProcess &&
      winnersData.thinkingProcess.length > 0
    ) {
      const interval = setInterval(() => {
        setCurrentThoughtIndex((prev) => {
          if (prev < winnersData.thinkingProcess!.length - 1) {
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 3000); // Show new thought every 3 seconds

      return () => clearInterval(interval);
    }
  }, [winnersData]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 6000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  const startPodiumAnimation = () => {
    setShowPodium(true);

    // Create the timeupdate handler function outside of setTimeout
    const handleTimeUpdate = () => {
      if (!audio || !winnersData?.timestamps) return;

      const currentTime = audio.currentTime;
      const timestamps = winnersData.timestamps;

      // Validate timestamps are valid numbers
      if (
        isNaN(timestamps.thirdPlace) ||
        isNaN(timestamps.secondPlace) ||
        isNaN(timestamps.firstPlace)
      ) {
        console.error("Invalid timestamps:", timestamps);
        return;
      }

      // Check if we're close to each announcement time (within 0.5 seconds)
      if (Math.abs(currentTime - timestamps.thirdPlace) < 0.5) {
        setAnnouncedPlace(3);
        setShowFireworks(true);
        setTimeout(() => setShowFireworks(false), 2000);
      } else if (Math.abs(currentTime - timestamps.secondPlace) < 0.5) {
        setAnnouncedPlace(2);
        setShowFireworks(true);
        setTimeout(() => setShowFireworks(false), 2000);
      } else if (Math.abs(currentTime - timestamps.firstPlace) < 0.5) {
        setAnnouncedPlace(1);
        setShowFireworks(true);
        setTimeout(() => setShowFireworks(false), 2000);
      }
    };

    // Create the ended handler function
    const handleEnded = () => {
      if (!audio) return;
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      setIsPlaying(false);
    };

    setTimeout(() => {
      setAnimationComplete(true);
      if (audio && winnersData?.timestamps) {
        // Add event listeners before playing
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("ended", handleEnded);

        // Start playing
        audio.play();
        setIsPlaying(true);
      }
    }, 1000);
  };

  const Fireworks = () => (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      {[...Array(20)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            backgroundColor: ["#ff0", "#f0f", "#0ff", "#f00", "#0f0"][
              Math.floor(Math.random() * 5)
            ],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: "firework 1s ease-out forwards",
            "@keyframes firework": {
              "0%": {
                transform: "scale(0)",
                opacity: 1,
              },
              "100%": {
                transform: "scale(20)",
                opacity: 0,
              },
            },
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}
    </Box>
  );

  const Podium = () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        height: "400px",
        position: "relative",
        mb: 4,
      }}
    >
      {/* Second Place */}
      <Box
        sx={{
          width: "200px",
          height: "200px",
          backgroundColor: "#C0C0C0",
          margin: "0 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          pb: 2,
          transform: showPodium
            ? announcedPlace === 2
              ? "translateY(0) scale(1.1)"
              : "translateY(0) scale(1)"
            : "translateY(100px) scale(1)",
          opacity: showPodium ? 1 : 0,
          transition: "all 0.5s ease-out",
          transitionDelay: "0.5s",
          boxShadow:
            announcedPlace === 2 ? "0 0 20px rgba(255, 255, 255, 0.8)" : "none",
        }}
      >
        <Typography
          variant="h6"
          color="white"
          sx={{
            fontWeight: announcedPlace === 2 ? "bold" : "normal",
            opacity: announcedPlace === 2 ? 1 : 0,
            transform:
              announcedPlace === 2 ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.3s ease-out",
          }}
        >
          {winnersData?.winners[1]?.teamName || "2nd Place"}
        </Typography>
      </Box>

      {/* First Place */}
      <Box
        sx={{
          width: "200px",
          height: "300px",
          backgroundColor: "#FFD700",
          margin: "0 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          pb: 2,
          transform: showPodium
            ? announcedPlace === 1
              ? "translateY(0) scale(1.1)"
              : "translateY(0) scale(1)"
            : "translateY(100px) scale(1)",
          opacity: showPodium ? 1 : 0,
          transition: "all 0.5s ease-out",
          transitionDelay: "0s",
          boxShadow:
            announcedPlace === 1 ? "0 0 20px rgba(255, 255, 255, 0.8)" : "none",
        }}
      >
        <Typography
          variant="h6"
          color="white"
          sx={{
            fontWeight: announcedPlace === 1 ? "bold" : "normal",
            opacity: announcedPlace === 1 ? 1 : 0,
            transform:
              announcedPlace === 1 ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.3s ease-out",
          }}
        >
          {winnersData?.winners[0]?.teamName || "1st Place"}
        </Typography>
      </Box>

      {/* Third Place */}
      <Box
        sx={{
          width: "200px",
          height: "150px",
          backgroundColor: "#CD7F32",
          margin: "0 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          pb: 2,
          transform: showPodium
            ? announcedPlace === 3
              ? "translateY(0) scale(1.1)"
              : "translateY(0) scale(1)"
            : "translateY(100px) scale(1)",
          opacity: showPodium ? 1 : 0,
          transition: "all 0.5s ease-out",
          transitionDelay: "1s",
          boxShadow:
            announcedPlace === 3 ? "0 0 20px rgba(255, 255, 255, 0.8)" : "none",
        }}
      >
        <Typography
          variant="h6"
          color="white"
          sx={{
            fontWeight: announcedPlace === 3 ? "bold" : "normal",
            opacity: announcedPlace === 3 ? 1 : 0,
            transform:
              announcedPlace === 3 ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.3s ease-out",
          }}
        >
          {winnersData?.winners[2]?.teamName || "3rd Place"}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Container
      maxWidth={false}
      sx={{ width: "100%", height: "100vh" }}
      className="team-dark"
    >
      {showFireworks && <Fireworks />}
      <Box sx={{ width: "100%", height: "100vh" }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <EmojiEventsIcon sx={{ fontSize: 40, color: "gold", mr: 2 }} />
            <Typography variant="h4" component="h1">
              Competition Winners
            </Typography>
          </Box>

          {!winnersData && !loading && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 8,
                minHeight: "60vh",
                width: "100%",
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={generateWinnersAnnouncement}
                startIcon={<VolumeUpIcon sx={{ fontSize: 40 }} />}
                sx={{
                  py: 3,
                  px: 6,
                  fontSize: "1.5rem",
                  borderRadius: 4,
                  boxShadow: 4,
                  "&:hover": {
                    transform: "scale(1.05)",
                    transition: "transform 0.2s",
                  },
                }}
              >
                Generate Winners Announcement
              </Button>
            </Box>
          )}

          {loading && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "60vh",
                width: "100%",
              }}
            >
              <CircularProgress size={60} />
              <Typography
                variant="h6"
                sx={{
                  mt: 2,
                  textAlign: "center",
                  maxWidth: "600px",
                  px: 2,
                }}
              >
                {loadingMessages[loadingMessageIndex]}
              </Typography>
            </Box>
          )}

          {error && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="error" gutterBottom>
                {error}
              </Typography>
              <Button variant="contained" onClick={generateWinnersAnnouncement}>
                Try Again
              </Button>
            </Box>
          )}

          {winnersData?.thinkingProcess &&
            winnersData.thinkingProcess.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      AIs Analysis:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {winnersData.thinkingProcess[currentThoughtIndex].thought}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" color="primary">
                      🤖 AIs Witty Comment:
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                      {
                        winnersData.thinkingProcess[currentThoughtIndex]
                          .wittyComment
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}

          {winnersData && !showPodium && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={startPodiumAnimation}
                startIcon={<EmojiEventsIcon />}
              >
                Show Podium
              </Button>
            </Box>
          )}

          {winnersData && showPodium && <Podium />}
        </Paper>
      </Box>
    </Container>
  );
}
