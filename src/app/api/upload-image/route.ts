import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import TeamImage from "@/models/TeamImage";

export async function POST(request: Request) {
  try {
    const { teamName, image } = await request.json();

    if (!teamName || !image) {
      return NextResponse.json(
        { error: "Team name and image are required" },
        { status: 400 }
      );
    }

    console.log("Connecting to database...");
    await connectDB();
    console.log("Connected to database successfully");

    // Create a new team image document
    const teamImage = new TeamImage({
      teamName,
      image,
      createdAt: new Date(),
    });

    console.log("Saving image to database...");
    // Save to database
    await teamImage.save();
    console.log("Image saved successfully");

    return NextResponse.json(
      { message: "Image uploaded successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Error uploading image. Please try again." },
      { status: 500 }
    );
  }
}
