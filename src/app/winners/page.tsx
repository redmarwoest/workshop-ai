"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
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
}

export default function WinnersPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [winnersData, setWinnersData] = useState<WinnersResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

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

  const togglePlayback = () => {
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
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
              <Typography variant="h6" sx={{ mt: 2 }}>
                Generating announcement...
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

          {winnersData?.script && (
            <Paper
              elevation={2}
              sx={{ p: 3, mb: 4, backgroundColor: "#f5f5f5" }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={togglePlayback}
                  startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                  sx={{ mr: 2 }}
                >
                  {isPlaying ? "Pause" : "Play"} Announcement
                </Button>
              </Box>
              <Typography
                variant="h6"
                component="h2"
                gutterBottom
                sx={{ color: "primary.main" }}
              >
                Winners Announcement
              </Typography>
              <Typography
                variant="body1"
                sx={{ whiteSpace: "pre-line", fontStyle: "italic" }}
              >
                {winnersData.script}
              </Typography>
            </Paper>
          )}

          {winnersData?.winners && (
            <Grid container spacing={4}>
              {winnersData.winners.map((winner, index) => (
                <Grid key={index}>
                  <Card
                    elevation={3}
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: -20,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor:
                          index === 0
                            ? "gold"
                            : index === 1
                            ? "silver"
                            : "#cd7f32",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      {index + 1}
                    </Box>

                    <CardContent sx={{ mt: 2 }}>
                      <Typography variant="h5" component="h3" gutterBottom>
                        {winner.teamName}
                      </Typography>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Score: {winner.score}
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle1" gutterBottom>
                        Feedback
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {winner.feedback}
                      </Typography>

                      <Typography variant="subtitle1" gutterBottom>
                        Strengths
                      </Typography>
                      <ul>
                        {winner.strengths.map((strength, i) => (
                          <li key={i}>
                            <Typography variant="body2">{strength}</Typography>
                          </li>
                        ))}
                      </ul>

                      <Typography variant="subtitle1" gutterBottom>
                        Areas for Improvement
                      </Typography>
                      <ul>
                        {winner.weaknesses.map((weakness, i) => (
                          <li key={i}>
                            <Typography variant="body2">{weakness}</Typography>
                          </li>
                        ))}
                      </ul>

                      <Typography variant="subtitle1" gutterBottom>
                        Suggestions
                      </Typography>
                      <ul>
                        {winner.suggestions.map((suggestion, i) => (
                          <li key={i}>
                            <Typography variant="body2">
                              {suggestion}
                            </Typography>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
