import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required." },
        { status: 400 }
      );
    }

    if (password !== process.env.GALLERY_ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set("gallery_admin", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Gallery auth error:", error);

    return NextResponse.json(
      { error: "Authentication failed." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") || "";

  const authenticated = cookie
    .split(";")
    .some(
      (item) => item.trim() === "gallery_admin=authenticated"
    );

  return NextResponse.json({
    authenticated,
  });
}
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
  });

  response.cookies.set("gallery_admin", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}