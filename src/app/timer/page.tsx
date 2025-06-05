"use client";

import { useState, useEffect } from "react";
import { Box, Container, Typography, Paper, Button } from "@mui/material";
import { useRouter } from "next/navigation";

export default function TimerPage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 0) {
            clearInterval(timer);
            setIsRunning(false);
            setIsTimeUp(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
    setIsTimeUp(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsTimeUp(false);
    setTimeLeft(25 * 60);
  };

  const handleGoToWinners = () => {
    router.push("/winners");
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Container
      maxWidth={false}
      sx={{ width: "100%", height: "100vh" }}
      className="team-dark"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          gap: 4,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 8,
            backgroundColor: "transparent",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            width: "100%",
          }}
        >
          {isTimeUp ? (
            <>
              <Typography
                variant="h2"
                component="div"
                sx={{
                  fontSize: { xs: "2rem", md: "3rem" },
                  fontWeight: "bold",
                  color: "#fff",
                  textShadow: "0 0 20px rgba(162, 89, 255, 0.5)",
                  mb: 2,
                }}
              >
                {`Times up! Please scan the QR code and upload your solution`}
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleGoToWinners}
                sx={{
                  fontSize: "1.5rem",
                  py: 2,
                  px: 4,
                  backgroundColor: "#a259ff",
                  "&:hover": {
                    backgroundColor: "#7c2fff",
                  },
                }}
              >
                Go to Winners
              </Button>
            </>
          ) : (
            <Typography
              variant="h1"
              component="div"
              sx={{
                fontSize: { xs: "8rem", md: "12rem" },
                fontWeight: "bold",
                color: "#fff",
                textShadow: "0 0 20px rgba(162, 89, 255, 0.5)",
              }}
            >
              {`${minutes.toString().padStart(2, "0")}:${seconds
                .toString()
                .padStart(2, "0")}`}
            </Typography>
          )}
        </Paper>

        <Box sx={{ display: "flex", gap: 2, marginBottom: "2rem" }}>
          {!isRunning ? (
            <Button
              variant="contained"
              size="large"
              onClick={handleStart}
              sx={{
                fontSize: "1.5rem",
                py: 2,
                px: 4,
                backgroundColor: "#a259ff",
                "&:hover": {
                  backgroundColor: "#7c2fff",
                },
              }}
            >
              Start Timer
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              onClick={handleReset}
              sx={{
                fontSize: "1.5rem",
                py: 2,
                px: 4,
                backgroundColor: "#ff5252",
                "&:hover": {
                  backgroundColor: "#ff0000",
                },
              }}
            >
              Reset Timer
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
}
