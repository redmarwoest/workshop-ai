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
    
    For each team, select a leader: the member with the highest business experience level. If there is a tie, choose the one with the highest AI experience. Include the leader as a separate field in the team object.
    
    Make sure every participant is assigned to exactly one team. If the number of participants is not divisible by 5, create a smaller last team. Do not leave anyone out. Return only the JSON, no extra text.
    
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
    
    Please format the response as a JSON array of teams, where each team has a name, a leader (the member with the most business experience, and if tied, the highest AI experience), and an array of members. 
    Example format:
    {
      "teams": [
        {
          "name": "Team 1",
          "leader": { "name": "John Doe", "experience": "senior", "aiExperience": "3", "approach": "take charge" },
          "members": [
            { "name": "John Doe", "experience": "senior", "aiExperience": "3", "approach": "take charge" },
            { "name": "Jane Smith", "experience": "medior", "aiExperience": "4", "approach": "research" }
          ]
        }
      ]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
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

    // Remove code block markers if present
    const cleanedContent = content.replace(/```json|```/g, "").trim();

    // Extract the first JSON object or array
    const match = cleanedContent.match(/({[\s\S]*})|(\[[\s\S]*\])/);
    if (!match) {
      throw new Error("No valid JSON found in OpenAI response");
    }
    const jsonString = match[0];
    const teams = JSON.parse(jsonString);

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error creating teams:", error);
    return NextResponse.json(
      { error: "Error creating teams" },
      { status: 500 }
    );
  }
}
