"use client";

import { useState, useRef } from "react";
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
import { PhotoCamera, Upload } from "@mui/icons-material";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCamera, setShowCamera] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      setError(
        "Error accessing camera. Please make sure you have granted camera permissions."
      );
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg");
        setImage(imageData);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
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
                    {!showCamera && !image && (
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Button
                          variant="contained"
                          startIcon={<PhotoCamera />}
                          onClick={startCamera}
                        >
                          Open Camera
                        </Button>
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
                      </Box>
                    )}

                    {showCamera && (
                      <Box sx={{ position: "relative" }}>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          style={{ width: "100%", maxHeight: "400px" }}
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={captureImage}
                          sx={{ mt: 2 }}
                        >
                          Take Photo
                        </Button>
                      </Box>
                    )}

                    {image && (
                      <Box>
                        <img
                          src={image}
                          alt="Captured"
                          style={{ width: "100%", maxHeight: "400px" }}
                        />
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setImage(null);
                            startCamera();
                          }}
                          sx={{ mt: 2 }}
                        >
                          Retake Photo
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
