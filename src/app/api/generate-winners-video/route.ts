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

    // Fetch all submissions with rankings
    const submissions = await TeamSubmission.find({})
      .sort({ "analysis.ranking": 1 })
      .limit(3);

    if (submissions.length === 0) {
      return NextResponse.json(
        { error: "No submissions found to analyze" },
        { status: 404 }
      );
    }

    // Generate a script for the video
    const scriptPrompt = `Create an engaging and entertaining script for a video announcing the winners of an AI solution competition. The script should be conversational, sassy, and professional. Include dramatic pauses and emphasis points for the voice actor.

Here are the top 3 teams:

${submissions.map((sub, index) => `
${index + 1}. Team: ${sub.teamName}
Score: ${sub.analysis.score}
Feedback: ${sub.analysis.feedback}
Problem: ${sub.problemStatement}
Solution: ${sub.proposedSolution}
Impact: ${sub.expectedImpact}
`).join("\n")}

Format the script with clear sections and timing suggestions. Include:
1. An exciting introduction
2. Announcement of each winner with their key achievements
3. What made each solution special
4. A dramatic conclusion

Make it sound natural and conversational, like a charismatic host announcing the winners.`;

    const scriptResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: scriptPrompt,
        },
      ],
      temperature: 0.8,
    });

    const script = scriptResponse.choices[0]?.message?.content;

    // Generate speech from the script using OpenAI's TTS
    const speechResponse = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy", // You can choose from: alloy, echo, fable, onyx, nova, shimmer
      input: script || "",
    });

    // Convert the audio to a buffer
    const audioBuffer = await speechResponse.arrayBuffer();

    // Here you would typically:
    // 1. Upload the audio to a video generation service
    // 2. Add visual elements (team logos, animations, etc.)
    // 3. Generate the final video
    // For now, we'll return the audio and script for manual video creation

    return NextResponse.json({
      script,
      audioUrl: `data:audio/mp3;base64,${Buffer.from(audioBuffer).toString('base64')}`,
      winners: submissions.map(sub => ({
        teamName: sub.teamName,
        score: sub.analysis.score,
        feedback: sub.analysis.feedback,
        problemStatement: sub.problemStatement,
        proposedSolution: sub.proposedSolution,
        expectedImpact: sub.expectedImpact,
      })),
    });
  } catch (error) {
    console.error("Error generating winners video:", error);
    return NextResponse.json(
      { error: "Error generating winners video" },
      { status: 500 }
    );
  }
} 