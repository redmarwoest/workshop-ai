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

    // Extract JSON from the response, handling markdown formatting
    const content = response.choices[0]?.message?.content || "{}";
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || [
      null,
      content,
    ];
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
  } catch (error) {
    console.error("Error analyzing image:", error);
    return NextResponse.json(
      { error: "Error analyzing image" },
      { status: 500 }
    );
  }
}
