// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/db/mongodb";
import { User } from "@/lib/db/models";

export async function POST(req: NextRequest) {
    try {
        const { fullName, email, phone, password, board, class: studentClass, schoolName, city } = await req.json();

        // Validation
        if (!fullName || !email || !phone || !password || !board || !studentClass) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("career_guru");

        // Check if user exists
        const existingUser = await db.collection("users").findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists with this email or phone" }, { status: 409 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user: Omit<User, "_id"> = {
            fullName,
            email,
            phone,
            password: hashedPassword,
            board,
            class: studentClass,
            schoolName,
            city,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection("users").insertOne(user);

        // Create initial progress for user
        await db.collection("user_progress").insertOne({
            userId: result.insertedId.toString(),
            viewedSolutions: [],
            freeSolutionsUsed: 0,
            bookmarks: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: "User created successfully",
            userId: result.insertedId
        }, { status: 201 });

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}