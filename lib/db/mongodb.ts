// lib/db/mongodb.ts
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
    throw new Error("Please add your MongoDB URI to .env.local");
}

const uri = process.env.MONGODB_URI as string;
const options = {
  tls: true,
  tlsAllowInvalidCertificates: false,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
    var _mongoClientPromise: Promise<MongoClient>;
}

if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

let indexesEnsured = false;

export async function ensureIndexes() {
  if (indexesEnsured) return;
  indexesEnsured = true;
  try {
    const client = await clientPromise;
    const db = client.db("career_guru");

    const specs: { coll: string; keys: Record<string, 1 | -1>; options?: Record<string, unknown> }[] = [
      // solutions
      { coll: "solutions", keys: { board: 1, class: 1, subject: 1, chapter: 1 } },
      { coll: "solutions", keys: { sourceUrl: 1 }, options: { unique: true, sparse: true } },
      // mcq_questions
      { coll: "mcq_questions", keys: { examType: 1, subject: 1 } },
      { coll: "mcq_questions", keys: { board: 1, class: 1, subject: 1 } },
      // user_progress
      { coll: "user_progress", keys: { userId: 1, board: 1, class: 1, subject: 1, chapter: 1 } },
    ];

    for (const spec of specs) {
      try {
        await db.collection(spec.coll).createIndex(spec.keys, spec.options);
      } catch (err) {
        console.error(`Index creation failed on ${spec.coll}:`, (err as Error).message);
      }
    }
  } catch (err) {
    console.error("Index creation error:", (err as Error).message);
    indexesEnsured = false; // allow retry on next call
  }
}

// Kick off index creation in the background (non-blocking, safe to fail)
ensureIndexes();

export default clientPromise;