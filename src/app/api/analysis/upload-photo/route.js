import { NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";

// Use service account JSON from environment variable
const GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID; // Set this in your .env file

export const POST = async (req) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const customName = formData.get("customName") || file.name;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Google Auth
    let authOptions;
    if (GOOGLE_SERVICE_ACCOUNT_JSON) {
      // Parse and fix private_key line breaks if needed
      const credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON);
      if (credentials.private_key) {
        credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
      }
      authOptions = {
        credentials,
        scopes: ["https://www.googleapis.com/auth/drive"],
      };
    } else {
      throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON environment variable");
    }
    const auth = new google.auth.GoogleAuth(authOptions);
    const drive = google.drive({ version: "v3", auth });

    // Upload file (use stream)
    const res = await drive.files.create({
      requestBody: {
        name: customName + file.name.substring(file.name.lastIndexOf(".")),
        parents: [DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: file.type,
        body: Readable.from(buffer),
      },
      fields: "id,webViewLink,webContentLink",
    });
    const fileId = res.data.id;

    // Make file public
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // Get shareable link
    const fileMeta = await drive.files.get({
      fileId,
      fields: "webViewLink,webContentLink",
    });
    return NextResponse.json({ url: fileMeta.data.webViewLink });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
