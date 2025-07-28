
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const POST = async (req) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const customName = formData.get("customName") || (file && file.name);
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Upload to Cloudinary
    const uploadRes = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_UPLOAD_FOLDER || undefined,
          public_id: customName ? customName.replace(/\.[^/.]+$/, "") : undefined,
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({ url: uploadRes.secure_url });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
