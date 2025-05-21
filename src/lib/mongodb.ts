import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}

// Debug log to verify the URI is being read (remove in production)
console.log("MongoDB URI found:", MONGODB_URI.substring(0, 20) + "...");

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseGlobal: MongooseCache | undefined;
}

const cached = global.mongooseGlobal || { conn: null, promise: null };

if (!global.mongooseGlobal) {
  global.mongooseGlobal = cached;
}

async function connectDB() {
  try {
    if (cached.conn) {
      console.log("Using cached database connection");
      return cached.conn;
    }

    if (!cached.promise) {
      console.log("Creating new database connection...");
      const opts = {
        bufferCommands: false,
      };

      cached.promise = mongoose
        .connect(MONGODB_URI as string, opts)
        .then((mongoose) => {
          console.log("Successfully connected to MongoDB");
          return mongoose;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    cached.promise = null;
    throw error;
  }
}

export default connectDB;
