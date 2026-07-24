import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { ObjectId } from "mongodb";
import { logAudit } from "@/lib/audit-log";
import bcrypt from "bcryptjs";
import { escapeRegex } from "@/lib/security";
import { validateObjectId } from "@/lib/security";
import { z } from "zod";

/* ---------- Schemas (strict, trimmed, password policy) ---------- */
const userCreateSchema = z
  .object({
    fullName: z.string().min(1).trim(),
    email: z.string().email().trim(),
    password: z
      .string()
      .min(10, "Password must be at least 10 characters")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number")
      .regex(/[^A-Za-z0-9]/, "Password must contain a symbol")
      .refine(
        (pw) => !/[<>\"'().,\[\]]/.test(pw),
        { message: "Password contains forbidden characters" }
      ),
    phone: z.string().trim().optional(),
    role: z
      .enum(["student", "counsellor", "admin", "super_admin"])
      .default("student"),
    status: z.enum(["active", "inactive"]).default("active"),
  })
  .strict(); // reject unknown fields

const userUpdateSchema = z
  .object({
    fullName: z.string().min(1).trim().optional(),
    email: z.string().email().trim().optional(),
    phone: z.string().trim().optional(),
    password: z
      .string()
      .min(10, "Password must be at least 10 characters")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number")
      .regex(/[^A-Za-z0-9]/, "Password must contain a symbol")
      .refine(
        (pw) => !/[<>\"'().,\[\]]/.test(pw),
        { message: "Password contains forbidden characters" }
      )
      .optional(),
    role: z.enum(["student", "counsellor", "admin", "super_admin"]).optional(),
    status: z.enum(["active", "inactive"]).optional(),
  })
  .strict(); // reject unknown fields

/* ---------- GET: Search users ---------- */
export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";

    // Sanitize search term
    const safeSearch = escapeRegex(search);

    const client = await clientPromise;
    const db = client.db("career_guru");

    const query: Record<string, unknown> = {};
    if (role) {
      // Validate role against whitelist (handled later in sanitisation)
      const cleanRole = role.trim().toLowerCase();
      if (["student", "counsellor", "admin", "super_admin"].includes(cleanRole)) {
        query.role = cleanRole;
      } else {
        return NextResponse.json({ error: "Invalid role filter" }, { status: 400 });
      }
    }
    if (status) query.status = { $in: [status] };

    if (search) {
      query.$or = [
        { fullName: { $regex: safeSearch } },
        { email: { $regex: safeSearch } },
        { phone: { $regex: safeSearch } },
      ];
    }

    // Use strict query shape (no prototype pollution)
    const users = await db.collection("users")
      .find(query, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    const total = await db.collection("users").countDocuments();
    const activeCount = await db.collection("users").countDocuments({ status: "active" });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newToday = await db.collection("users").countDocuments({ createdAt: { $gte: today } });

    return NextResponse.json({
      users,
      stats: { total, active: activeCount || total, newToday },
    });
  } catch (err) {
    console.error("[SECURITY] Admin users GET error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- POST: Create a user ---------- */
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    const validation = userCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { fullName, email, password, phone, role, status } = validation.data;

    const client = await clientPromise;
    const db = client.db("career_guru");

    // Ensure email is unique
    const existing = await db.collection("users").findOne({ email: validation.data.email });
    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await db.collection("users").insertOne({
      fullName,
      email,
      password: hashedPassword,
      phone: phone ?? "",
      role,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await logAudit({
      action: "CREATE",
      collection: "users",
      documentId: result.insertedId.toString(),
      performedBy: admin.userId,
      performedByEmail: admin.email,
      changes: { fullName, email, role, status },
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error("[SECURITY] Admin users POST error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- PUT: Update a user ---------- */
export async function PUT(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const {
      id,
      role,
      status,
      fullName,
      email,
      phone,
      password,
    }: {
      id?: string;
      role?: string;
      status?: string;
      fullName?: string;
      email?: string;
      phone?: string;
      password?: string;
    } = await req.json();

    if (!id) return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    validateObjectId(id);

    const data: Record<string, unknown> = {};
    if (role !== undefined) data.role = role;
    if (status !== undefined) data.status = status;
    if (fullName !== undefined) data.fullName = fullName;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (password !== undefined) data.password = password;

    const validation = userUpdateSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: validation.error.format() },
        { status: 400 }
      );
    }

    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (validation.data.fullName) update.fullName = validation.data.fullName;
    if (validation.data.email) update.email = validation.data.email;
    if (validation.data.phone !== undefined) update.phone = validation.data.phone;
    if (validation.data.role) update.role = validation.data.role;
    if (validation.data.status) update.status = validation.data.status;
    if (validation.data.password) {
      update.password = await bcrypt.hash(validation.data.password, 12);
    }

    const client = await clientPromise;
    const db = client.db("career_guru");
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await logAudit({
      action: "UPDATE",
      collection: "users",
      documentId: id,
      performedBy: admin.userId,
      performedByEmail: admin.email,
      changes: { ...validation.data, password: password ? "[changed]" : undefined },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[SECURITY] Admin users PUT error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/* ---------- DELETE: Remove a user ---------- */
export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    validateObjectId(id);

    const client = await clientPromise;
    const db = client.db("career_guru");

    const target = await db.collection("users").findOne({ _id: new ObjectId(id) });
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (target.role === "super_admin") {
      return NextResponse.json({ error: "Cannot delete super admin" }, { status: 403 });
    }

    await db.collection("users").deleteOne({ _id: new ObjectId(id) });

    await logAudit({
      action: "DELETE",
      collection: "users",
      documentId: id,
      performedBy: admin.userId,
      performedByEmail: admin.email,
      changes: { email: target.email, role: target.role, fullName: target.fullName },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[SECURITY] Admin users DELETE error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}