"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";

interface VideoResponse {
  script: string;
  audioUrl: string;
  winners: {
    teamName: string;
    score: number;
    feedback: string;
    problemStatement: string;
    proposedSolution: string;
    expectedImpact: string;
  }[];
}

export default function WinnersVideoPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoResponse | null>(null);

  const generateVideo = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/generate-winners-video", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to generate video");
      }

      const data = await response.json();
      setVideoData(data);
    } catch (error) {
      setError("Error generating video. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <VideocamIcon sx={{ fontSize: 40, color: "primary.main", mr: 2 }} />
            <Typography variant="h4" component="h1">
              Winners Announcement Video
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={generateVideo}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <VideocamIcon />}
            sx={{ mb: 4 }}
          >
            {loading ? "Generating Video..." : "Generate Video"}
          </Button>

          {error && (
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
          )}

          {videoData && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Generated Script
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={10}
                value={videoData.script}
                variant="outlined"
                sx={{ mb: 4 }}
                InputProps={{
                  readOnly: true,
                }}
              />

              <Typography variant="h6" gutterBottom>
                Audio Preview
              </Typography>
              <audio controls src={videoData.audioUrl} style={{ width: "100%" }} />
              <Box sx={{ mb: 4 }} />

              <Typography variant="h6" gutterBottom>
                Winners Data
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {videoData.winners.map((winner, index) => (
                  <Paper key={winner.teamName} elevation={2} sx={{ p: 2 }}>
                    <Typography variant="h6" color="primary">
                      {index + 1}. {winner.teamName}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      Score: {winner.score}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Problem: {winner.problemStatement}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Solution: {winner.proposedSolution}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Impact: {winner.expectedImpact}
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                      Feedback: {winner.feedback}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
} 