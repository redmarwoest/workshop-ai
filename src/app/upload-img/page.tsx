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

export default function UploadImage() {
  const [teamName, setTeamName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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

      const response = await fetch("/api/upload-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamName,
          image,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      setSuccess(true);
      setTeamName("");
      setImage(null);
    } catch (error) {
      setError("Error uploading image. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Upload Team Photo
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid>
                <TextField
                  fullWidth
                  label="Team Name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                />
              </Grid>

              <Grid>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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

              {error && (
                <Grid>
                  <Typography color="error" align="center">
                    {error}
                  </Typography>
                </Grid>
              )}

              {success && (
                <Grid>
                  <Typography color="success.main" align="center">
                    Image uploaded successfully!
                  </Typography>
                </Grid>
              )}
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}
