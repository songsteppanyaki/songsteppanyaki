import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const title = (searchParams.get("title") || "").trim();
    const description = (searchParams.get("description") || "").trim();

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;

    if (!apiSecret || !cloudName || !apiKey) {
      return NextResponse.json(
        { error: "Cloudinary environment variables are missing." },
        { status: 500 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const uploadPreset = "song_teppanyaki_gallery";
    const folder = "song-teppanyaki/gallery";
    const context = `title=${title}|description=${description}`;
    const displayName = title;

    const uploadParams: Record<string, string | number> = {
      timestamp,
      upload_preset: uploadPreset,
      folder,
      context,
      display_name: displayName,
    };

    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      apiSecret
    );

    return NextResponse.json({
      signature,
      timestamp,
      cloudName,
      apiKey,
      uploadPreset,
      folder,
      context,
      displayName,
    });
  } catch (error) {
    console.error("Cloudinary signature error:", error);

    return NextResponse.json(
      { error: "Failed to generate upload signature." },
      { status: 500 }
    );
  }
}