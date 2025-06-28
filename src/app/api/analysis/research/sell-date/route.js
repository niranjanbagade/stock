import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function PATCH(req) {
  try {
    const { id, sellDate } = await req.json();
    if (!id || !sellDate) {
      return Response.json({ error: "Missing id or sellDate" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("analysis");
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { sellDate: new Date(sellDate), updatedAt: new Date() } }
    );
    if (result.modifiedCount === 1) {
      return Response.json({ success: true });
    } else {
      return Response.json(
        { success: false, error: "Not found or not updated" },
        { status: 404 }
      );
    }
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
