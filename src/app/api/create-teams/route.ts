import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { participants } = await request.json();

    const prompt = `Create balanced teams of maximum 5 people from the following participants. Consider three equally important factors:
    1. Business Experience Level (junior, medior, senior, managing, principal)
    2. AI Experience Level (1-5, where 1 is no experience and 5 is expert)
    3. Approach Style (take charge, research, ask, observe)
    
    Each team should have a balanced mix of:
    - Business and AI experience levels to ensure optimal collaboration and knowledge sharing
    - Different approach styles to ensure diverse problem-solving methods
    - Complementary personalities and working styles
    
    For example:
    - If someone has high business experience (principal) but low AI experience (1), they should be paired with someone who has high AI experience
    - If someone has a "take charge" approach, they should be balanced with someone who has a "research" or "observe" approach
    - Teams should have a mix of different approaches to ensure well-rounded problem-solving
    
    Participants:
    ${participants
      .map(
        (p: {
          name: string;
          experience: string;
          aiExperience: string;
          approach: string;
        }) =>
          `- ${p.name}: Business Experience: ${p.experience}, AI Experience: ${p.aiExperience}, Approach: ${p.approach}`
      )
      .join("\n")}
    
    Please format the response as a JSON array of teams, where each team has a name and an array of members. 
    Example format:
    {
      "teams": [
        {
          "name": "Team 1",
          "members": [
            { "name": "John Doe", "experience": "senior", "aiExperience": "3", "approach": "take charge" }
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
