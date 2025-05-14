import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { participants } = await request.json();

    const prompt = `Create balanced teams of maximum 5 people from the following participants, considering their experience levels and AI experience. 
    Each team should have a mix of experience levels to ensure balanced learning and collaboration.
    
    Participants:
    ${participants
      .map(
        (p: any) =>
          `- ${p.name}: Experience: ${p.experience}, AI Experience: ${p.aiExperience}, Approach: ${p.approach}`
      )
      .join("\n")}
    
    Please format the response as a JSON array of teams, where each team has a name and an array of members. 
    Example format:
    {
      "teams": [
        {
          "name": "Team Alpha",
          "members": [
            { "name": "John Doe", "experience": "Beginner", "aiExperience": "1", "approach": "Research" }
          ]
        }
      ]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const teams = JSON.parse(content);
    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error creating teams:", error);
    return NextResponse.json(
      { error: "Error creating teams" },
      { status: 500 }
    );
  }
}
