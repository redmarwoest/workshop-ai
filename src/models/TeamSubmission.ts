import mongoose from "mongoose";

const teamSubmissionSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
  },
  problemStatement: {
    type: String,
    required: true,
  },
  targetAudience: {
    type: String,
    required: true,
  },
  proposedSolution: {
    type: String,
    required: true,
  },
  dataNeeds: {
    type: String,
    required: true,
  },
  expectedImpact: {
    type: String,
    required: true,
  },
  ethicalConsiderations: {
    type: String,
    required: true,
  },
  implementationPlan: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TeamSubmission =
  mongoose.models.TeamSubmission ||
  mongoose.model("ai-workshop-team-submission", teamSubmissionSchema);

export default TeamSubmission;
