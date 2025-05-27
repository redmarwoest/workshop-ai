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

  const loadingMessages = [
    "Calculating the perfect blend of creativity and technical prowess...",
    "Teaching my neural networks to appreciate good code...",
    "Counting semicolons and converting them to points...",
    "Running advanced algorithms to detect the most elegant solutions...",
    "Consulting with my AI colleagues about the best practices...",
    "Measuring the complexity of your solutions (and my confusion)...",
    "Converting coffee consumption to productivity metrics...",
    "Analyzing the ratio of comments to actual code...",
    "Checking if anyone used Comic Sans in their code...",
    "Calculating the perfect balance of innovation and practicality...",
  ];

  const generateWinnersAnnouncement = async () => {
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
    setTimeout(() => {
      setAnimationComplete(true);
      if (audio) {
        audio.play();
        setIsPlaying(true);
      }
    }, 3000);
  };

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
          transform: showPodium ? "translateY(0)" : "translateY(100px)",
          opacity: showPodium ? 1 : 0,
          transition: "all 0.5s ease-out",
          transitionDelay: "0.5s",
        }}
      >
        <Typography variant="h6" color="white">
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
          transform: showPodium ? "translateY(0)" : "translateY(100px)",
          opacity: showPodium ? 1 : 0,
          transition: "all 0.5s ease-out",
          transitionDelay: "0s",
        }}
      >
        <Typography variant="h6" color="white">
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
          transform: showPodium ? "translateY(0)" : "translateY(100px)",
          opacity: showPodium ? 1 : 0,
          transition: "all 0.5s ease-out",
          transitionDelay: "1s",
        }}
      >
        <Typography variant="h6" color="white">
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
                py: 8,
              }}
            >
              <CircularProgress size={60} />
              <Typography
                variant="h6"
                sx={{ mt: 2, textAlign: "center", maxWidth: "600px" }}
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
                      AI's Analysis:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {winnersData.thinkingProcess[currentThoughtIndex].thought}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" color="primary">
                      🤖 AI's Witty Comment:
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
