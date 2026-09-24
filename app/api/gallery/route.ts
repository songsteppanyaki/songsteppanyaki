import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const result =
      await cloudinary.api.resources_by_asset_folder(
        "song-teppanyaki/gallery",
        {
          max_results: 100,
        }
      );

    const items = result.resources.map((resource: any) => ({
      url: resource.secure_url,
      publicId: resource.public_id,
      type: resource.resource_type,
      format: resource.format,
      width: resource.width,
      height: resource.height,
    }));

    return NextResponse.json({
      items,
    });
  } catch (error) {
    console.error("Gallery API error:", error);

    return NextResponse.json(
      { error: "Failed to load gallery." },
      { status: 500 }
    );
  }
}