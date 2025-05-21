import mongoose from "mongoose";

const teamImageSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TeamImage =
  mongoose.models.TeamImage ||
  mongoose.model("ai-workshop-team-picture", teamImageSchema);

export default TeamImage;
