import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import TeamSubmission from "@/models/TeamSubmission";
import OpenAI from "openai";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const execAsync = promisify(exec);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Ensure temp directory exists
const TEMP_DIR = path.join(process.cwd(), "temp");
await fs.mkdir(TEMP_DIR, { recursive: true });

async function generateVideoWithFFmpeg(
  audioPath: string,
  outputPath: string,
  script: string
) {
  // Create a simple video with text overlays using FFmpeg
  const ffmpegCommand = `
    ffmpeg -y -i ${audioPath} \
    -vf "drawtext=text='${
      script.split("\n")[0]
    }':fontsize=24:fontcolor=white:x=(w-text_w)/2:y=h-th-10:enable='between(t,0,5)',
          drawtext=text='${
            script.split("\n")[1]
          }':fontsize=24:fontcolor=white:x=(w-text_w)/2:y=h-th-10:enable='between(t,5,10)'" \
    -c:a copy ${outputPath}
  `;

  await execAsync(ffmpegCommand);
}

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
    const scriptPrompt = `Create an engaging and entertaining script for a 60-second video announcing the winners of an AI solution competition. The script should be conversational, sassy, and professional. Include dramatic pauses and emphasis points for the voice actor.

Here are the top 3 teams:

${submissions
  .map(
    (sub, index) => `
${index + 1}. Team: ${sub.teamName}
Score: ${sub.analysis.score}
Feedback: ${sub.analysis.feedback}
Problem: ${sub.problemStatement}
Solution: ${sub.proposedSolution}
Impact: ${sub.expectedImpact}
`
  )
  .join("\n")}

Format the script with clear sections and timing suggestions. Include:
1. An exciting introduction (15 seconds)
2. Announcement of each winner with their key achievements (30 seconds)
3. What made each solution special (10 seconds)
4. A dramatic conclusion (5 seconds)

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
      voice: "alloy",
      input: script || "",
    });

    // Generate unique filenames
    const sessionId = uuidv4();
    const audioPath = path.join(TEMP_DIR, `${sessionId}_audio.mp3`);
    const videoPath = path.join(TEMP_DIR, `${sessionId}_video.mp4`);

    // Save audio to file
    const audioBuffer = await speechResponse.arrayBuffer();
    await fs.writeFile(audioPath, Buffer.from(audioBuffer));

    // Generate video with FFmpeg
    await generateVideoWithFFmpeg(audioPath, videoPath, script || "");

    // Read the generated video
    const videoBuffer = await fs.readFile(videoPath);

    // Clean up temporary files
    await fs.unlink(audioPath);
    await fs.unlink(videoPath);

    return NextResponse.json({
      script,
      videoUrl: `data:video/mp4;base64,${videoBuffer.toString("base64")}`,
      winners: submissions.map((sub) => ({
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
