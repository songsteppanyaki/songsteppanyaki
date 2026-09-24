import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request: Request) {
  try {
    const { publicId, resourceType } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { error: "Missing publicId." },
        { status: 400 }
      );
    }

    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType === "video" ? "video" : "image",
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Delete gallery error:", error);

    return NextResponse.json(
      { error: "Failed to delete gallery item." },
      { status: 500 }
    );
  }
}