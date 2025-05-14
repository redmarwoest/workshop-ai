"use client";

import { useForm, Controller, SubmitHandler, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
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
import { useState } from "react";

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

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData>,
    defaultValues: {
      name: "",
      experience: "",
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
    } catch (error) {
      setSubmitError("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={1} sx={{ p: 4, textAlign: "center" }}>
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
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            AI Workshop Survey
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
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
                        <MenuItem value="beginner">Beginner</MenuItem>
                        <MenuItem value="intermediate">Intermediate</MenuItem>
                        <MenuItem value="advanced">Advanced</MenuItem>
                        <MenuItem value="expert">Expert</MenuItem>
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

              <Grid item xs={12}>
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

              <Grid item xs={12}>
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
                          <Grid item xs={6}>
                            <Paper elevation={2} sx={{ p: 1 }}>
                              <img
                                src="/image1.jpg"
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
                          <Grid item xs={6}>
                            <Paper elevation={2} sx={{ p: 1 }}>
                              <img
                                src="/image2.jpg"
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

              <Grid item xs={12}>
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
                          value="research"
                          control={<Radio />}
                          label="I research and gather information first"
                        />
                        <FormControlLabel
                          value="experiment"
                          control={<Radio />}
                          label="I experiment and learn through trial and error"
                        />
                        <FormControlLabel
                          value="ask"
                          control={<Radio />}
                          label="I ask others for help and guidance"
                        />
                        <FormControlLabel
                          value="observe"
                          control={<Radio />}
                          label="I observe and learn from others' experiences"
                        />
                      </RadioGroup>
                      {errors.approach && (
                        <FormHelperText>
                          {errors.approach.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
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
                        <FormHelperText>
                          {errors.notRobot.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
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
                <Grid item xs={12}>
                  <Typography color="error" align="center">
                    {submitError}
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
