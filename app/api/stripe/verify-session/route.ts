
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json(
      { paid: false, error: "Invalid session ID" },
      { status: 400 }
    );
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    console.error("STRIPE_SECRET_KEY is missing");

    return NextResponse.json(
      { paid: false, error: "Payment verification unavailable" },
      { status: 500 }
    );
  }

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const paid =
      session.mode === "payment" &&
      session.status === "complete" &&
      session.payment_status === "paid";

    return NextResponse.json(
      {
        paid,
        sessionId: paid ? session.id : undefined,
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Stripe verification failed:", error);

    return NextResponse.json(
      { paid: false, error: "Unable to verify payment" },
      { status: 500 }
    );
  }
}
