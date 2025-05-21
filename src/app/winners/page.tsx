"use client";

import { useState, useEffect } from "react";
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

interface Winner {
  teamName: string;
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

interface WinnersResponse {
  winners: Winner[];
  winnersSummary: string;
  allSubmissions: Winner[];
}

export default function WinnersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [winnersData, setWinnersData] = useState<WinnersResponse | null>(null);

  const analyzeSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/analyze-submissions", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to analyze submissions");
      }

      const data = await response.json();
      setWinnersData(data);
    } catch (error) {
      setError("Error analyzing submissions. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyzeSubmissions();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "80vh",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
          <Button variant="contained" onClick={analyzeSubmissions}>
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }

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

          {winnersData?.winnersSummary && (
            <Paper
              elevation={2}
              sx={{ p: 3, mb: 4, backgroundColor: "#f5f5f5" }}
            >
              <Typography
                variant="h6"
                component="h2"
                gutterBottom
                sx={{ color: "primary.main" }}
              >
                Winners Summary
              </Typography>
              <Typography
                variant="body1"
                sx={{ whiteSpace: "pre-line", fontStyle: "italic" }}
              >
                {winnersData.winnersSummary}
              </Typography>
            </Paper>
          )}

          <Grid container spacing={4}>
            {winnersData?.winners.map((winner, index) => (
              <Grid item key={winner.teamName} xs={12} md={4}>
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
                      backgroundColor: index === 0 ? "gold" : index === 1 ? "silver" : "#cd7f32",
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
                    <Typography
                      variant="h6"
                      color="primary"
                      gutterBottom
                    >
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
                          <Typography variant="body2">{suggestion}</Typography>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
} 