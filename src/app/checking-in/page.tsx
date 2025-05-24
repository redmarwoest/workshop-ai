"use client";

import { useForm, Controller, SubmitHandler, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ReactConfetti from "react-confetti";
import {
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  Checkbox,
  FormHelperText,
} from "@mui/material";
import { useState, useEffect } from "react";

type FormData = {
  name: string;
  experience: string;
  aiExperience: string;
  aiImageGuess: string;
  approach: string;
  notRobot: boolean;
};

const schema = yup
  .object({
    name: yup.string().required("Name is required"),
    experience: yup.string().required("Please select your experience level"),
    aiExperience: yup
      .string()
      .required("Please select your AI experience level"),
    aiImageGuess: yup
      .string()
      .required("Please select which image is AI generated"),
    approach: yup
      .string()
      .required("Please select your approach to challenges"),
    notRobot: yup.boolean().oneOf([true], "Please confirm you are not a robot"),
  })
  .required();

export default function CheckInForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData>,
    defaultValues: {
      name: "",
      experience: "junior",
      aiExperience: "",
      aiImageGuess: "",
      approach: "",
      notRobot: false,
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch("/api/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      setSubmittedName(data.name);
      setSubmitSuccess(true);
      reset();
    } catch {
      setSubmitError("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      style={{ padding: "0rem" }}
      className="checking-dark"
    >
      <div
        style={{ padding: "1.5rem", gap: "1rem", backgroundColor: "#EAF2FF" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <img
            src="/ai-fix.svg"
            alt="logo"
            style={{ width: "32px", height: "auto" }}
          />
          <Typography variant="h5" component="h1">
            Hey AI, Fix my city
          </Typography>
        </div>
      </div>
      {submitSuccess ? (
        <>
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={500}
          />
          <Paper elevation={0} sx={{ p: 8, textAlign: "center" }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Thank you for subscribing!
            </Typography>
            <Typography variant="h6" gutterBottom>
              Hi {submittedName},
            </Typography>
            <Typography variant="body1">
              Thank you for joining our session. We will find you a team in a
              moment please stay put.
            </Typography>
          </Paper>
        </>
      ) : (
        <form style={{ padding: "1.5rem" }} onSubmit={handleSubmit(onSubmit)}>
          <Typography
            variant="h6"
            component="h1"
            style={{ marginBottom: "1rem" }}
          >
            Sign up form
          </Typography>
          <Grid container spacing={3}>
            <Grid width={"100%"}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Name"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>

            <Grid width={"100%"}>
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.experience}>
                    <FormLabel>What is your experience level?</FormLabel>
                    <Select {...field}>
                      <MenuItem value="junior">Junior</MenuItem>
                      <MenuItem value="medior">Medior</MenuItem>
                      <MenuItem value="senior">Senior</MenuItem>
                      <MenuItem value="managing">Managing</MenuItem>
                      <MenuItem value="principal">Principal</MenuItem>
                    </Select>
                    {errors.experience && (
                      <FormHelperText>
                        {errors.experience.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid width={"100%"}>
              <Controller
                name="aiExperience"
                control={control}
                render={({ field }) => (
                  <FormControl error={!!errors.aiExperience}>
                    <FormLabel>
                      How would you rate your experience with AI?
                    </FormLabel>
                    <RadioGroup {...field}>
                      <FormControlLabel
                        value="1"
                        control={<Radio />}
                        label="Level 1 - No Experience"
                      />
                      <FormControlLabel
                        value="2"
                        control={<Radio />}
                        label="Level 2 - Basic Understanding"
                      />
                      <FormControlLabel
                        value="3"
                        control={<Radio />}
                        label="Level 3 - Some Experience"
                      />
                      <FormControlLabel
                        value="4"
                        control={<Radio />}
                        label="Level 4 - Experienced"
                      />
                      <FormControlLabel
                        value="5"
                        control={<Radio />}
                        label="Level 5 - Expert"
                      />
                    </RadioGroup>
                    {errors.aiExperience && (
                      <FormHelperText>
                        {errors.aiExperience.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid width={"100%"}>
              <Controller
                name="aiImageGuess"
                control={control}
                render={({ field }) => (
                  <FormControl error={!!errors.aiImageGuess}>
                    <FormLabel>
                      Which of these images is AI generated?
                    </FormLabel>
                    <RadioGroup {...field} row>
                      <Grid container spacing={2}>
                        <Grid width={"100%"}>
                          <Paper elevation={2} sx={{ p: 1 }}>
                            <img
                              src="/northern_lights_1.jpg"
                              alt="Image 1"
                              style={{ width: "100%", height: "auto" }}
                            />
                            <FormControlLabel
                              value="image1"
                              control={<Radio />}
                              label="Image 1"
                            />
                          </Paper>
                        </Grid>
                        <Grid width={"100%"}>
                          <Paper elevation={2} sx={{ p: 1 }}>
                            <img
                              src="/northern_lights_2.jpg"
                              alt="Image 2"
                              style={{ width: "100%", height: "auto" }}
                            />
                            <FormControlLabel
                              value="image2"
                              control={<Radio />}
                              label="Image 2"
                            />
                          </Paper>
                        </Grid>
                      </Grid>
                    </RadioGroup>
                    {errors.aiImageGuess && (
                      <FormHelperText>
                        {errors.aiImageGuess.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid width={"100%"}>
              <Controller
                name="approach"
                control={control}
                render={({ field }) => (
                  <FormControl error={!!errors.approach}>
                    <FormLabel>
                      How do you usually approach challenges or unfamiliar
                      situations?
                    </FormLabel>
                    <RadioGroup {...field}>
                      <FormControlLabel
                        value="take charge"
                        control={<Radio />}
                        label="I take charge and figure things out as I go."
                      />
                      <FormControlLabel
                        value="research"
                        control={<Radio />}
                        label="I research thoroughly before making a move."
                      />
                      <FormControlLabel
                        value="ask"
                        control={<Radio />}
                        label="I ask others for input and collaborate on solutions."
                      />
                      <FormControlLabel
                        value="observe"
                        control={<Radio />}
                        label="I wait and observe before acting."
                      />
                    </RadioGroup>
                    {errors.approach && (
                      <FormHelperText>{errors.approach.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid width={"100%"}>
              <Controller
                name="notRobot"
                control={control}
                render={({ field }) => (
                  <FormControl error={!!errors.notRobot}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="I am not a robot"
                    />
                    {errors.notRobot && (
                      <FormHelperText>{errors.notRobot.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid width={"100%"}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </Grid>

            {submitError && (
              <Grid width={"100%"}>
                <Typography color="error" align="center">
                  {submitError}
                </Typography>
              </Grid>
            )}
          </Grid>
        </form>
      )}
    </Container>
  );
}
