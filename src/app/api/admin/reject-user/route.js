import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db();

    // Delete user from users, accounts, and sessions collections
    const userResult = await db.collection("users").deleteOne({ _id: new ObjectId(userId) });
    const accountResult = await db.collection("accounts").deleteMany({ userId: new ObjectId(userId) });
    const sessionResult = await db.collection("sessions").deleteMany({ userId: new ObjectId(userId) });

    if (userResult.deletedCount === 1) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
