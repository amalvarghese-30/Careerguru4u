import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/career_guru";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@careerguru.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.error("ERROR: ADMIN_PASSWORD environment variable is required.");
  console.error("Usage: ADMIN_PASSWORD=yourpassword npx tsx scripts/seed.ts");
  process.exit(1);
}

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db("career_guru");
    console.log("Connected to MongoDB");

    // Create admin user if not exists
    const existingAdmin = await db.collection("users").findOne({
      $or: [{ email: ADMIN_EMAIL }, { role: "admin" }, { role: "super_admin" }]
    });

    if (existingAdmin) {
      console.log(`Admin user already exists: ${existingAdmin.email} (role: ${existingAdmin.role})`);
    } else {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD!, 12);
      const result = await db.collection("users").insertOne({
        fullName: "Super Admin",
        email: ADMIN_EMAIL,
        phone: "0000000000",
        password: hashedPassword,
        board: "N/A",
        class: "N/A",
        role: "super_admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`Admin user created: ${ADMIN_EMAIL} (role: super_admin, _id: ${result.insertedId})`);
    }

    // Create sample solutions if collection is empty
    const solutionCount = await db.collection("solutions").countDocuments();
    if (solutionCount === 0) {
      const sampleSolutions = [
        { question: "What is the capital of India?", answer: "New Delhi is the capital of India.", board: "CBSE", class: 10, subject: "Social Science", chapter: "India - Location and Physical Features", questionNumber: 1, isFree: true, viewCount: 15200, helpfulCount: 340, createdAt: new Date() },
        { question: "Explain the process of photosynthesis.", answer: "Photosynthesis is the process by which green plants convert light energy into chemical energy...", board: "CBSE", class: 10, subject: "Science", chapter: "Life Processes", questionNumber: 1, isFree: true, viewCount: 12800, helpfulCount: 290, createdAt: new Date() },
        { question: "Solve: 2x + 5 = 15", answer: "2x + 5 = 15\n2x = 10\nx = 5", board: "CBSE", class: 10, subject: "Mathematics", chapter: "Linear Equations", questionNumber: 1, isFree: true, viewCount: 8500, helpfulCount: 180, createdAt: new Date() },
        { question: "What is the chemical formula of water?", answer: "H₂O - Two hydrogen atoms bonded to one oxygen atom.", board: "CBSE", class: 9, subject: "Science", chapter: "Atoms and Molecules", questionNumber: 2, isFree: true, viewCount: 9500, helpfulCount: 210, createdAt: new Date() },
        { question: "Define noun and its types.", answer: "A noun is a word that names a person, place, thing, or idea. Types: Proper, Common, Collective, Abstract, Material.", board: "ICSE", class: 8, subject: "English", chapter: "Parts of Speech", questionNumber: 1, isFree: true, viewCount: 7200, helpfulCount: 160, createdAt: new Date() },
      ];
      await db.collection("solutions").insertMany(sampleSolutions);
      console.log(`Created ${sampleSolutions.length} sample solutions`);
    } else {
      console.log(`Solutions collection already has ${solutionCount} documents`);
    }

    // Ensure required indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true, sparse: true });
    await db.collection("users").createIndex({ phone: 1 }, { unique: true, sparse: true });
    await db.collection("user_progress").createIndex({ userId: 1 });
    await db.collection("solutions").createIndex({ board: 1, class: 1, subject: 1, chapter: 1 });
    await db.collection("counselling_requests").createIndex({ status: 1 });
    await db.collection("counselling_requests").createIndex({ createdAt: -1 });

    console.log("Indexes ensured");
    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
