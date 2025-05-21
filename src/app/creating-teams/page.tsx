"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

interface Participant {
  name: string;
  experience: string;
  aiExperience: string;
  approach: string;
}

interface Team {
  name: string;
  members: Participant[];
}

export default function CreatingTeams() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/participants");
      if (!response.ok) {
        throw new Error("Failed to fetch participants");
      }
      const data = await response.json();
      setParticipants(data);
      console.log("Participants fetched:", data);
    } catch (error) {
      setError("Error fetching participants");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createTeams = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/create-teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ participants }),
      });

      if (!response.ok) {
        throw new Error("Failed to create teams");
      }

      const data = await response.json();
      setTeams(data.teams);
    } catch (error) {
      setError("Error creating teams");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Container maxWidth={false} sx={{ width: "100%" }}>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={0} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Team Creation
          </Typography>

          <Box
            sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 4 }}
          >
            <Button
              variant="contained"
              onClick={fetchParticipants}
              disabled={loading}
            >
              Get Names
            </Button>
            <Button
              variant="contained"
              onClick={createTeams}
              disabled={loading || participants.length === 0}
            >
              Create Teams
            </Button>
          </Box>

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Typography color="error" align="center" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Grid container spacing={3}>
            {/* Participants List */}
            <Grid width={"20%"}>
              <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  Participants ({participants.length})
                </Typography>
                <List>
                  {participants.map((participant, index) => (
                    <Box key={index}>
                      <ListItem>
                        <ListItemText primary={participant.name} />
                      </ListItem>
                      {index < participants.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Teams List */}
            <Grid width={"78%"}>
              {teams.length > 0 ? (
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Generated Teams
                  </Typography>
                  {teams.map((team, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        {team.name}
                      </Typography>
                      <Box component="ul" sx={{ pl: 2 }}>
                        {team.members.map((member, memberIndex) => (
                          <Box component="li" key={memberIndex}>
                            <Typography>
                              {member.name} - Experience: {member.experience},
                              AI Experience: {member.aiExperience}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Paper elevation={2} sx={{ p: 2, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    Teams will appear here after clicking &ldquo;Create
                    Teams&rdquo;
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
}
