import mongoose from "mongoose";

const checkInSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    experience: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
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
        "trial and error",
        "research and learn",
        "ask for help",
        "give up and try something else",
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
  mongoose.model("ai-workshop", checkInSchema, "ai-workshop-answers");
