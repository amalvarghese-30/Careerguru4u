/**
 * MongoDB import — inserts structured solutions into the database.
 *
 * Reads solutions from JSON files or accepts Solution objects directly.
 * Uses the existing MongoDB connection from lib/db.
 */
import type { Solution } from "../types";

interface ImportResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export async function importToMongoDB(solutions: Solution[]): Promise<ImportResult> {
  const result: ImportResult = { inserted: 0, updated: 0, skipped: 0, errors: [] };

  try {
    const clientPromise = (await import("../../../lib/db/mongodb")).default;
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("solutions");

    for (const solution of solutions) {
      try {
        const filter = {
          board: solution.board,
          class: solution.class,
          subject: solution.subject,
          chapter: solution.chapter,
          questionNumber: solution.questionNumber,
        };

        const existing = await collection.findOne(filter);
        if (existing) {
          await collection.updateOne(filter, {
            $set: {
              question: solution.question,
              solution: solution.solution,
              images: solution.images,
              tables: solution.tables,
              equations: solution.equations,
              questionType: solution.questionType,
              difficulty: solution.difficulty,
              version: (existing.version || 0) + 1,
              originalData: existing.originalData || {
                question: existing.question,
                solution: existing.solution,
              },
              updatedAt: new Date(),
            },
          });
          result.updated++;
        } else {
          solution.createdAt = new Date();
          solution.updatedAt = new Date();
          solution.version = 1;
          delete solution._id;
          await collection.insertOne(solution as any);
          result.inserted++;
        }
      } catch (err) {
        result.errors.push(`Failed to import ${solution.questionNumber}: ${(err as Error).message}`);
      }
    }
  } catch (err) {
    result.errors.push(`MongoDB connection failed: ${(err as Error).message}`);
  }

  return result;
}
