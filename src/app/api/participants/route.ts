import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CheckIn from "@/models/CheckIn";

export async function GET() {
  try {
    await connectDB();
    const participants = await CheckIn.find(
      {},
      {
        name: 1,
        experience: 1,
        aiExperience: 1,
        approach: 1,
        _id: 0,
      }
    );

    return NextResponse.json(participants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json(
      { error: "Error fetching participants" },
      { status: 500 }
    );
  }
}
