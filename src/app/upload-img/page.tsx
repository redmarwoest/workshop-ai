"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  Grid,
  CircularProgress,
} from "@mui/material";
import { Upload } from "@mui/icons-material";

interface ProposalData {
  problemStatement: string;
  targetAudience: string;
  proposedSolution: string;
  dataNeeds: string;
  expectedImpact: string;
  ethicalConsiderations: string;
  implementationPlan: string;
}

export default function UploadImage() {
  const [teamName, setTeamName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [proposalData, setProposalData] = useState<ProposalData | null>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if the file is HEIC
      if (
        file.type === "image/heic" ||
        file.name.toLowerCase().endsWith(".heic")
      ) {
        try {
          // Convert HEIC to JPEG using a canvas
          const image = new Image();
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Create a promise to handle the image loading
          const imageLoadPromise = new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
          });

          // Load the image
          image.src = URL.createObjectURL(file);
          await imageLoadPromise;

          // Set canvas dimensions to match the image
          canvas.width = image.width;
          canvas.height = image.height;

          // Draw the image on the canvas
          ctx?.drawImage(image, 0, 0);

          // Convert to JPEG
          const jpegData = canvas.toDataURL("image/jpeg", 0.9);
          setImage(jpegData);
        } catch (error) {
          setError(
            "Error converting HEIC image. Please try uploading a different format."
          );
          console.error("HEIC conversion error:", error);
        }
      } else {
        // Handle regular image files
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !image) {
      setError("Please provide both team name and image");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // First, get the ChatGPT analysis
      const analysisResponse = await fetch("/api/img-to-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamName,
          image,
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error("Failed to analyze image");
      }

      const analysisData = await analysisResponse.json();
      setProposalData(analysisData.submission);
      setShowReview(true);
    } catch (error) {
      setError("Error analyzing image. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!proposalData) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/submit-proposal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamName,
          ...proposalData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit proposal");
      }

      setSuccess(true);
      setTeamName("");
      setImage(null);
      setProposalData(null);
      setShowReview(false);
    } catch (error) {
      setError("Error submitting proposal. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleProposalChange = (field: keyof ProposalData, value: string) => {
    if (proposalData) {
      setProposalData({
        ...proposalData,
        [field]: value,
      });
    }
  };

  return (
    <Container
      maxWidth="md"
      className="checking-dark"
      sx={{
        minHeight: "100vh",
        display: "flex",
        padding: 0,
        "@media (max-width:600px)": { padding: 0 },
      }}
    >
      <Box sx={{ width: "100%", mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {showReview ? "Review Proposal" : "Upload Picture of proposal"}
          </Typography>

          {!showReview ? (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid width={"100%"}>
                  <TextField
                    fullWidth
                    label="Team Name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                  />
                </Grid>

                <Grid>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {!image && (
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<Upload />}
                      >
                        Upload Image
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleFileUpload}
                        />
                      </Button>
                    )}

                    {image && (
                      <Box>
                        <img
                          src={image}
                          alt="Uploaded"
                          style={{ width: "100%", maxHeight: "400px" }}
                        />
                        <Button
                          variant="outlined"
                          onClick={() => setImage(null)}
                          sx={{ mt: 2 }}
                        >
                          Remove Image
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Grid>

                <Grid>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={loading || !teamName || !image}
                  >
                    {loading ? <CircularProgress size={24} /> : "Submit"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          ) : (
            <Box>
              <Grid container spacing={3}>
                <Grid width={"100%"}>
                  <img
                    src={image || ""}
                    alt="Team Proposal"
                    style={{
                      width: "100%",
                      maxHeight: "400px",
                      objectFit: "contain",
                    }}
                  />
                </Grid>
                <Grid width={"100%"}>
                  <TextField
                    fullWidth
                    label="Problem Statement"
                    multiline
                    value={proposalData?.problemStatement || ""}
                    onChange={(e) =>
                      handleProposalChange("problemStatement", e.target.value)
                    }
                  />
                </Grid>
                <Grid width={"100%"}>
                  <TextField
                    fullWidth
                    label="Target Audience"
                    multiline
                    value={proposalData?.targetAudience || ""}
                    onChange={(e) =>
                      handleProposalChange("targetAudience", e.target.value)
                    }
                  />
                </Grid>
                <Grid width={"100%"}>
                  <TextField
                    fullWidth
                    label="Proposed Solution"
                    multiline
                    rows={3}
                    value={proposalData?.proposedSolution || ""}
                    onChange={(e) =>
                      handleProposalChange("proposedSolution", e.target.value)
                    }
                  />
                </Grid>
                <Grid width={"100%"}>
                  <TextField
                    fullWidth
                    label="Data Needs"
                    multiline
                    value={proposalData?.dataNeeds || ""}
                    onChange={(e) =>
                      handleProposalChange("dataNeeds", e.target.value)
                    }
                  />
                </Grid>
                <Grid width={"100%"}>
                  <TextField
                    fullWidth
                    label="Expected Impact"
                    multiline
                    value={proposalData?.expectedImpact || ""}
                    onChange={(e) =>
                      handleProposalChange("expectedImpact", e.target.value)
                    }
                  />
                </Grid>
                <Grid width={"100%"}>
                  <TextField
                    fullWidth
                    label="Ethical Considerations"
                    multiline
                    value={proposalData?.ethicalConsiderations || ""}
                    onChange={(e) =>
                      handleProposalChange(
                        "ethicalConsiderations",
                        e.target.value
                      )
                    }
                  />
                </Grid>
                <Grid width={"100%"}>
                  <TextField
                    fullWidth
                    label="Implementation Plan"
                    multiline
                    value={proposalData?.implementationPlan || ""}
                    onChange={(e) =>
                      handleProposalChange("implementationPlan", e.target.value)
                    }
                  />
                </Grid>
                <Grid width={"100%"}>
                  <Box
                    sx={{ display: "flex", gap: 2, justifyContent: "center" }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => setShowReview(false)}
                      disabled={loading}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleFinalSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <CircularProgress size={24} />
                      ) : (
                        "Submit Proposal"
                      )}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {error && (
            <Grid>
              <Typography color="error" align="center">
                {error}
              </Typography>
            </Grid>
          )}

          {success && (
            <Grid>
              <Typography color="success.main" align="center" marginTop={8}>
                Proposal submitted successfully!
              </Typography>
            </Grid>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
