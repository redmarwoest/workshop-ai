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

You MUST respond with ONLY a JSON object in this exact format:
{
  "score": number,
  "feedback": "string (be sassy and witty but professional)",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "suggestions": ["string"]
}

DO NOT include any text before or after the JSON object. DO NOT use markdown formatting. DO NOT include any explanations or apologies.`;

        const response = await openai.chat.completions.create({
          model: "gpt-4.1",
          messages: [
            {
              role: "system",
              content:
                "You are a JSON-only response bot. You must ONLY respond with valid JSON objects, no other text or explanations.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content || "{}";
        console.log("Raw model response:", content); // Debug log

        try {
          // Try to parse the content directly first
          const analysis = JSON.parse(content);

          // Update submission with analysis
          await TeamSubmission.findByIdAndUpdate(submission._id, {
            analysis: {
              score: analysis.score,
              feedback: analysis.feedback,
            },
          });

          return {
            teamName: submission.teamName,
            score: analysis.score,
            feedback: analysis.feedback,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses,
            suggestions: analysis.suggestions,
            problemStatement: submission.problemStatement,
            proposedSolution: submission.proposedSolution,
            expectedImpact: submission.expectedImpact,
          };
        } catch {
          console.error("JSON parse error. Content received:", content);
          throw new Error("Failed to parse model response");
        }
      })
    );

    // Sort submissions by score and take top 3
    const rankedSubmissions = analyzedSubmissions
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    // Generate sassy summary of winners
    const winnersPrompt = `Create an engaging and entertaining script for announcing the winners of an AI solution competition. The script should be conversational, sassy, and professional. Include dramatic pauses and emphasis points.

Here are the top 3 teams:

${rankedSubmissions
  .map(
    (sub, index) => `
${index + 1}. Team: ${sub.teamName}
Score: ${sub.score}
Feedback: ${sub.feedback}
Problem: ${sub.problemStatement}
Solution: ${sub.proposedSolution}
Impact: ${sub.expectedImpact}
Strengths: ${sub.strengths.join(", ")}
Weaknesses: ${sub.weaknesses.join(", ")}
`
  )
  .join("\n")}

Format the script with clear sections and include specific markers for when each winner is announced:
1. An exciting introduction (15 seconds)
2. Announcement of each winner with their key achievements (30 seconds each)
   - Use the exact phrase "ANNOUNCE_THIRD_PLACE" when announcing third place
   - Use the exact phrase "ANNOUNCE_SECOND_PLACE" when announcing second place
   - Use the exact phrase "ANNOUNCE_FIRST_PLACE" when announcing first place
3. What made each solution special (10 seconds)
4. A dramatic conclusion (5 seconds)
5. End with: "Can the members of ${
      rankedSubmissions[0].teamName
    } please come to the podium to collect their prize?"

Make it sound natural and conversational, like a charismatic host announcing the winners.`;

    const scriptResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: winnersPrompt,
        },
      ],
      temperature: 0.8,
    });

    const script = scriptResponse.choices[0]?.message?.content;
    console.log("Generated script:", script);

    // Convert character positions to approximate seconds
    // Assuming average speaking rate of 150 words per minute
    // Average word length of 5 characters
    const wordsPerSecond = 150 / 60; // 2.5 words per second
    const charsPerWord = 5;
    const charsPerSecond = wordsPerSecond * charsPerWord; // ~12.5 characters per second

    const timestamps = {
      thirdPlace:
        (script?.indexOf("ANNOUNCE_THIRD_PLACE") || 0) / charsPerSecond,
      secondPlace:
        (script?.indexOf("ANNOUNCE_SECOND_PLACE") || 0) / charsPerSecond,
      firstPlace:
        (script?.indexOf("ANNOUNCE_FIRST_PLACE") || 0) / charsPerSecond,
    };

    console.log("Extracted timestamps (in seconds):", timestamps);

    // Clean up the script by removing the markers
    const cleanScript = script
      ?.replace("ANNOUNCE_THIRD_PLACE", "")
      .replace("ANNOUNCE_SECOND_PLACE", "")
      .replace("ANNOUNCE_FIRST_PLACE", "");

    console.log("Cleaned script:", cleanScript);

    // Generate speech from the cleaned script
    const speechResponse = await openai.audio.speech.create({
      model: "tts-1",
      voice: "echo",
      input: cleanScript || "",
    });

    // Convert the speech to base64
    const audioBuffer = await speechResponse.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    return NextResponse.json({
      script: cleanScript,
      audioUrl: `data:audio/mp3;base64,${base64Audio}`,
      winners: rankedSubmissions,
      allSubmissions: analyzedSubmissions,
      timestamps, // Include timestamps in the response
    });
  } catch (error) {
    console.error("Error generating winners announcement:", error);
    return NextResponse.json(
      { error: "Error generating winners announcement" },
      { status: 500 }
    );
  }
}
