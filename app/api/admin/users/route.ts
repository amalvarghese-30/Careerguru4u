import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { logAudit } from "@/lib/audit-log";
import bcrypt from "bcryptjs";

const userCreateSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  role: z.enum(["student", "counsellor", "admin", "super_admin"]).default("student"),
  status: z.enum(["active", "inactive"]).default("active"),
});

const userUpdateSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["student", "counsellor", "admin", "super_admin"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";

    const client = await clientPromise;
    const db = client.db("career_guru");

    const query: Record<string, unknown> = {};
    if (role) query.role = role;
    if (status) query.status = { $in: [status] };
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

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
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validation = userCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error.flatten() }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("career_guru");

    const existing = await db.collection("users").findOne({ email: validation.data.email });
    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(validation.data.password, 10);

    const result = await db.collection("users").insertOne({
      fullName: validation.data.fullName,
      email: validation.data.email,
      password: hashedPassword,
      phone: validation.data.phone || "",
      role: validation.data.role,
      status: validation.data.status,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await logAudit({
      action: "CREATE", collection: "users",
      documentId: result.insertedId.toString(),
      performedBy: admin.userId, performedByEmail: admin.email,
      changes: { fullName: validation.data.fullName, email: validation.data.email, role: validation.data.role },
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Admin users POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, role, status, fullName, email, phone, password } = await req.json();
    if (!id) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (role !== undefined) data.role = role;
    if (status !== undefined) data.status = status;
    if (fullName !== undefined) data.fullName = fullName;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (password !== undefined) data.password = password;

    const validation = userUpdateSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error.flatten() }, { status: 400 });
    }

    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (validation.data.fullName) update.fullName = validation.data.fullName;
    if (validation.data.email) update.email = validation.data.email;
    if (validation.data.phone !== undefined) update.phone = validation.data.phone;
    if (validation.data.role) update.role = validation.data.role;
    if (validation.data.status) update.status = validation.data.status;
    if (validation.data.password) {
      update.password = await bcrypt.hash(validation.data.password, 10);
    }

    const client = await clientPromise;
    const db = client.db("career_guru");
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) }, { $set: update }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await logAudit({
      action: "UPDATE", collection: "users", documentId: id,
      performedBy: admin.userId, performedByEmail: admin.email,
      changes: { ...validation.data, password: password ? "[changed]" : undefined },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin users PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("career_guru");

    const target = await db.collection("users").findOne({ _id: new ObjectId(id) });
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (target.role === "super_admin") {
      return NextResponse.json({ error: "Cannot delete super admin" }, { status: 403 });
    }

    await db.collection("users").deleteOne({ _id: new ObjectId(id) });

    await logAudit({
      action: "DELETE", collection: "users", documentId: id,
      performedBy: admin.userId, performedByEmail: admin.email,
      changes: { email: target.email, role: target.role, fullName: target.fullName },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin users DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
