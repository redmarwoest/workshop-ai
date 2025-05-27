import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import TeamSubmission from "@/models/TeamSubmission";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await connectDB();

    const submission = new TeamSubmission(data);
    await submission.save();

    return NextResponse.json(
      { message: "Proposal submitted successfully" },
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
