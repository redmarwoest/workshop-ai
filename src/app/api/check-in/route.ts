import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CheckIn from "@/models/CheckIn";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "name",
      "experience",
      "aiExperience",
      "aiImageGuess",
      "approach",
      "notRobot",
    ];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    const checkIn = await CheckIn.create(body);

    return NextResponse.json(checkIn, { status: 201 });
  } catch (error) {
    console.error("Error creating check-in:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      { error: "Error creating check-in. Please try again." },
      { status: 500 }
    );
  }
}
