import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const client = await clientPromise;
    const db = client.db("career_guru");

    const totalUsers = await db.collection("users").countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newToday = await db.collection("users").countDocuments({ createdAt: { $gte: today } });
    const activeUsers = await db.collection("users").countDocuments({ status: "active" }) || totalUsers;

    const totalCareers = await db.collection("careers").countDocuments();
    const totalColleges = await db.collection("colleges").countDocuments();
    const totalScholarships = await db.collection("scholarships").countDocuments();
    const totalBlogPosts = await db.collection("blog_posts").countDocuments();
    const counsellingRequests = await db.collection("counselling_requests").countDocuments();
    const counsellingPending = await db.collection("counselling_requests").countDocuments({ status: "pending" });
    const totalLeads = await db.collection("leads").countDocuments();

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = await db.collection("users")
      .find({ createdAt: { $gte: sevenDaysAgo } }, { projection: { password: 0 } })
      .sort({ createdAt: -1 }).limit(5).toArray();

    const recentCounselling = await db.collection("counselling_requests")
      .find().sort({ createdAt: -1 }).limit(5).toArray();

    const recentLeads = await db.collection("leads")
      .find().sort({ createdAt: -1 }).limit(10).toArray();

    const recentAuditLogs = await db.collection("audit_logs")
      .find().sort({ timestamp: -1 }).limit(20).toArray();

    const usersByRole = await db.collection("users").aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]).toArray() as { _id: string; count: number }[];

    const leadsByStatus = await db.collection("leads").aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]).toArray() as { _id: string; count: number }[];

    const sessionsByStatus = await db.collection("counselling_requests").aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]).toArray() as { _id: string; count: number }[];

    return NextResponse.json({
      stats: {
        totalUsers, activeUsers, newToday, totalCareers, totalColleges,
        totalScholarships, totalBlogPosts, counsellingRequests, counsellingPending,
        totalLeads,
      },
      recentUsers,
      recentCounselling,
      recentLeads,
      recentAuditLogs,
      breakdowns: {
        usersByRole: usersByRole.reduce((acc, r) => {
          acc[r._id || "unknown"] = r.count; return acc;
        }, {} as Record<string, number>),
        leadsByStatus: leadsByStatus.reduce((acc, r) => {
          acc[r._id || "new"] = r.count; return acc;
        }, {} as Record<string, number>),
        sessionsByStatus: sessionsByStatus.reduce((acc, r) => {
          acc[r._id || "unknown"] = r.count; return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    console.error("Admin analytics GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
