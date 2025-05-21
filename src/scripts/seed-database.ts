import connectDB from "../lib/mongodb.js";
import { mockParticipants } from "../lib/mock-data.js";
import mongoose from "mongoose";

async function seedDatabase() {
  try {
    await connectDB();
    
    // Get the mongoose connection
    const mongoose = await connectDB();
    if (!mongoose.connection.db) {
      throw new Error("Database connection not established");
    }
    const db = mongoose.connection.db;
    
    // Clear existing participants
    await db.collection("participants").deleteMany({});
    
    // Insert mock participants
    const result = await db.collection("participants").insertMany(mockParticipants);
    
    console.log(`Successfully inserted ${result.insertedCount} participants`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase(); 