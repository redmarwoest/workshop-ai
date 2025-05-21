import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import TeamSubmission from "@/models/TeamSubmission";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST() {
  try {
    await connectDB();

    // Fetch all submissions
    const submissions = await TeamSubmission.find({});
    
    if (submissions.length === 0) {
      return NextResponse.json(
        { error: "No submissions found to analyze" },
        { status: 404 }
      );
    }

    // Analyze each submission
    const analyzedSubmissions = await Promise.all(
      submissions.map(async (submission) => {
        const prompt = `Analyze this AI solution proposal and provide a score (0-100) and detailed feedback. Be sassy and witty in your analysis, but maintain professionalism. Consider the following aspects:

Problem Statement: ${submission.problemStatement}
Target Audience: ${submission.targetAudience}
Proposed Solution: ${submission.proposedSolution}
Data Needs: ${submission.dataNeeds}
Expected Impact: ${submission.expectedImpact}
Ethical Considerations: ${submission.ethicalConsiderations}
Implementation Plan: ${submission.implementationPlan}

Provide your analysis in the following JSON format:
{
  "score": number,
  "feedback": "string (be sassy and witty but professional)",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "suggestions": ["string"]
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

        const analysis = JSON.parse(response.choices[0]?.message?.content || "{}");
        
        // Update submission with analysis
        submission.analysis = {
          score: analysis.score,
          feedback: analysis.feedback,
        };
        
        await submission.save();
        
        return {
          teamName: submission.teamName,
          score: analysis.score,
          feedback: analysis.feedback,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          suggestions: analysis.suggestions,
        };
      })
    );

    // Sort submissions by score
    const rankedSubmissions = analyzedSubmissions.sort((a, b) => b.score - a.score);

    // Update rankings in database
    await Promise.all(
      rankedSubmissions.map(async (submission, index) => {
        await TeamSubmission.findOneAndUpdate(
          { teamName: submission.teamName },
          { "analysis.ranking": index + 1 }
        );
      })
    );

    // Generate sassy summary of winners
    const winnersPrompt = `Create a sassy and witty summary of the top 3 winning teams from this AI solution competition. Here are the submissions:

${rankedSubmissions.slice(0, 3).map((sub, index) => `
${index + 1}. Team: ${sub.teamName}
Score: ${sub.score}
Feedback: ${sub.feedback}
Strengths: ${sub.strengths.join(", ")}
Weaknesses: ${sub.weaknesses.join(", ")}
`).join("\n")}

Make it entertaining but professional, highlighting what made each team stand out and why they deserve their ranking.`;

    const winnersResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: winnersPrompt,
        },
      ],
      temperature: 0.8,
    });

    return NextResponse.json({
      winners: rankedSubmissions.slice(0, 3),
      winnersSummary: winnersResponse.choices[0]?.message?.content,
      allSubmissions: rankedSubmissions,
    });
  } catch (error) {
    console.error("Error analyzing submissions:", error);
    return NextResponse.json(
      { error: "Error analyzing submissions" },
      { status: 500 }
    );
  }
} 