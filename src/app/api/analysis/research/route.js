import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("analysis");
    const allItems = await collection.find({}).toArray();
    const unapproved = allItems.filter(item => item.isAdminApproved === false);
    const approved = allItems.filter(item => item.isAdminApproved === true);
    return Response.json({ unapproved, approved });
  } catch (error) {
    return Response.json({ unapproved: [], approved: [], error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { id } = await req.json();
    if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("analysis");
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isAdminApproved: true } }
    );
    if (result.modifiedCount === 1) {
      return Response.json({ success: true });
    } else {
      return Response.json({ success: false, error: "Not found or not updated" }, { status: 404 });
    }
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
