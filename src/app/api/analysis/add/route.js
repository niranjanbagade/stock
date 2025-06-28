import { auth } from "../../../../auth";
import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user._id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();
    const analysisData = {
      ...body,
      userId: new ObjectId(session.user._id), // store as ObjectId
      userEmail: session.user.email, // store user email
      isAdminApproved: false,
      createdAt: new Date(),
      isDeleted: false,
      updatedAt: new Date(),
      sellDate: "",
    };
    await db.collection("analysis").insertOne(analysisData);
    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
