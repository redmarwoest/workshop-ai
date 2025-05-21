import mongoose from "mongoose";

const checkInSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    experience: {
      type: String,
      enum: ["junior", "medior", "senior", "managing", "principal"],
      required: [true, "Experience level is required"],
    },
    aiExperience: {
      type: String,
      enum: ["1", "2", "3", "4", "5"],
      required: [true, "AI experience level is required"],
    },
    aiImageGuess: {
      type: String,
      enum: ["image1", "image2"],
      required: [true, "AI image guess is required"],
    },
    approach: {
      type: String,
      enum: [
        "take charge",
        "research",
        "ask",
        "observe",
      ],
      required: [true, "Approach is required"],
    },
    notRobot: {
      type: Boolean,
      required: [true, "Robot verification is required"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.CheckIn ||
  mongoose.model("ai-workshop-answers", checkInSchema, "ai-workshop-answers");
