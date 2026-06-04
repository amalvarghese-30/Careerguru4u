import clientPromise from "@/lib/db/mongodb";

interface AuditEntry {
  action: string;
  collection: string;
  documentId?: string;
  performedBy: string;
  performedByEmail: string;
  changes?: Record<string, unknown>;
  timestamp: Date;
  ip?: string;
}

export async function logAudit(entry: Omit<AuditEntry, "timestamp">) {
  try {
    const client = await clientPromise;
    const db = client.db("career_guru");
    await db.collection("audit_logs").insertOne({
      ...entry,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Audit log error:", error);
  }
}

export async function getAuditLogs(limit = 50) {
  try {
    const client = await clientPromise;
    const db = client.db("career_guru");
    return await db.collection("audit_logs")
      .find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  } catch {
    return [];
  }
}
