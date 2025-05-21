import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import TeamSubmission from "@/models/TeamSubmission";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { teamName, image } = await request.json();

    if (!teamName || !image) {
      return NextResponse.json(
        { error: "Team name and image are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Use OpenAI's Vision API to extract text from the image
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract the following information from this image of a team proposal:
              1. Problem Statement
              2. Target Audience
              3. Proposed AI Solution
              4. Data Needs
              5. Expected Impact
              6. Ethical Considerations
              7. Implementation Plan
              
              Format the response as a JSON object with these exact keys:
              {
                "problemStatement": "string",
                "targetAudience": "string",
                "proposedSolution": "string",
                "dataNeeds": "string",
                "expectedImpact": "string",
                "ethicalConsiderations": "string",
                "implementationPlan": "string"
              }`,
            },
            {
              type: "image_url",
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const extractedContent = JSON.parse(response.choices[0]?.message?.content || "{}");

    // Create new team submission
    const teamSubmission = new TeamSubmission({
      teamName,
      image,
      ...extractedContent,
      analysis: {
        score: 0,
        feedback: "Pending analysis",
      },
    });

    await teamSubmission.save();

    return NextResponse.json(
      { message: "Proposal submitted successfully", submission: teamSubmission },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting proposal:", error);
    return NextResponse.json(
      { error: "Error submitting proposal" },
      { status: 500 }
    );
  }
} 