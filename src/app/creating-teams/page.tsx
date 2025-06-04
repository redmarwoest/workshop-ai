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
  Fade,
} from "@mui/material";
import Link from "next/link";

interface Participant {
  name: string;
  experience: string;
  aiExperience: string;
  approach: string;
}

interface Team {
  name: string;
  leader: Participant;
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
      // Sort participants alphabetically by name
      data.sort((a: Participant, b: Participant) =>
        a.name.localeCompare(b.name)
      );
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
    <Container maxWidth={false} sx={{ width: "100%" }} className="team-dark">
      <Box>
        <Paper elevation={0} sx={{ p: 4, backgroundColor: "transparent" }}>
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
            <Link href="/video" passHref>
              <Button variant="contained" color="secondary">
                Go to Video
              </Button>
            </Link>
          </Box>

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress sx={{ color: "#9c27b0" }} />
              <Typography sx={{ ml: 2 }}>
                {teams.length === 0
                  ? "The AI is analyzing the participants"
                  : "Loading..."}
              </Typography>
            </Box>
          )}

          {error && (
            <Typography color="error" align="center" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Grid
            container
            spacing={3}
            sx={{ width: "100%", display: "flex", flexDirection: "column" }}
          >
            {/* Participants List */}
            {participants.length > 0 && teams.length === 0 && (
              <Grid>
                <Typography variant="h6" gutterBottom>
                  Participants ({participants.length})
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  {participants.map((participant, index) => (
                    <Paper
                      key={index}
                      sx={{ p: 1, minWidth: 100, textAlign: "center" }}
                    >
                      <Typography>{participant.name}</Typography>
                    </Paper>
                  ))}
                </Box>
              </Grid>
            )}

            {/* Teams List */}
            {teams.length > 0 && (
              <Grid>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Generated Teams
                  </Typography>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gridTemplateRows: "repeat(2, 1fr)",
                      gap: "24px",
                      width: "100%",
                    }}
                  >
                    {Array.from({ length: 8 }).map((_, index) => {
                      const team = teams[index];
                      return (
                        <div key={index}>
                          <Fade
                            in={true}
                            timeout={1000}
                            style={{ transitionDelay: `${index * 100}ms` }}
                          >
                            <Paper key={index} sx={{ p: 4 }}>
                              {team ? (
                                <>
                                  <Typography variant="h6" gutterBottom>
                                    {team.name}
                                  </Typography>
                                  <ul style={{ paddingLeft: 16, margin: 0 }}>
                                    <li>
                                      <Typography>
                                        <strong>{team.leader.name}</strong>{" "}
                                        <span style={{ color: "#fff" }}>
                                          (captain)
                                        </span>
                                      </Typography>
                                    </li>
                                    {team.members
                                      .filter(
                                        (member) =>
                                          member.name !== team.leader.name
                                      )
                                      .map((member, memberIndex) => (
                                        <li key={memberIndex}>
                                          <Typography>{member.name}</Typography>
                                        </li>
                                      ))}
                                  </ul>
                                </>
                              ) : null}
                            </Paper>
                          </Fade>
                        </div>
                      );
                    })}
                  </div>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
}
