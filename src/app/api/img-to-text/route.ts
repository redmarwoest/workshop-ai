import { NextResponse } from "next/server";
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

    // Use OpenAI's Vision API to extract text from the image
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a JSON-only response bot. You must ONLY respond with valid JSON objects, no other text or explanations.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image of a team proposal and extract the following information. You MUST respond with ONLY a JSON object, no other text or explanations.

Required fields to extract:
1. Problem Statement
2. Target Audience
3. Proposed AI Solution
4. Data Needs
5. Expected Impact
6. Ethical Considerations
7. Implementation Plan

Your response must be a single JSON object with exactly these keys:
{
  "problemStatement": "string",
  "targetAudience": "string",
  "proposedSolution": "string",
  "dataNeeds": "string",
  "expectedImpact": "string",
  "ethicalConsiderations": "string",
  "implementationPlan": "string"
}

DO NOT include any text before or after the JSON object. DO NOT use markdown formatting. DO NOT include any explanations or apologies.`,
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

    const content = response.choices[0]?.message?.content || "{}";
    console.log("Raw model response:", content); // Debug log

    try {
      // Try to parse the content directly first
      const extractedContent = JSON.parse(content);

      return NextResponse.json(
        {
          message: "Image analyzed successfully",
          submission: {
            teamName,
            image,
            ...extractedContent,
          },
        },
        { status: 200 }
      );
    } catch {
      console.error("JSON parse error. Content received:", content); // Debug log

      // If direct parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch = content.match(
        /```(?:json)?\s*(\{[\s\S]*?\})\s*```/
      ) || [null, content];
      console.log("JSON match result:", jsonMatch); // Debug log

      try {
        const extractedContent = JSON.parse(jsonMatch[1]);
        return NextResponse.json(
          {
            message: "Image analyzed successfully",
            submission: {
              teamName,
              image,
              ...extractedContent,
            },
          },
          { status: 200 }
        );
      } catch {
        console.error("Second parse attempt failed. Content:", jsonMatch[1]); // Debug log
        return NextResponse.json(
          {
            error: "Failed to parse model response",
            details: content,
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("Error analyzing image:", error);
    return NextResponse.json(
      { error: "Error analyzing image" },
      { status: 500 }
    );
  }
}
