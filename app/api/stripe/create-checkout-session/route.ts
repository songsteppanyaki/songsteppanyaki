import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const bookingData = requestBody.bookingData;
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        {
          error:
            "STRIPE_SECRET_KEY is missing. Check your .env.local file.",
        },
        { status: 500 },
      );
    }

   const stripe = new Stripe(secretKey, {
  httpClient: Stripe.createFetchHttpClient(),
  maxNetworkRetries: 0,
});

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: 100,
            product_data: {
              name: "Song Teppanyaki Booking Deposit",
              description:
                "Non-refundable $200 booking deposit. The deposit will be applied toward the final event balance.",
            },
          },
        },
      ],

      phone_number_collection: {
        enabled: true,
      },

      success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${origin}/booking/payment?canceled=true`,

     metadata: {
  businessName: "Song Teppanyaki",
  depositAmount: "200",
  depositPolicy: "Non-refundable",

  fullName: String(bookingData?.fullName || ""),
  phone: String(bookingData?.phone || ""),
  email: String(bookingData?.email || ""),

  address: String(bookingData?.completeEventAddress || ""),

  eventDate: String(bookingData?.eventDate || ""),
  eventTime: String(bookingData?.eventTime || ""),
  occasion: String(bookingData?.occasion || ""),

  totalGuests: String(bookingData?.totalGuests || 0),

  guests: JSON.stringify(bookingData?.guests || []),
  proteins: JSON.stringify(bookingData?.proteins || []),
  addOns: JSON.stringify(bookingData?.addOns || []),

  allergies: JSON.stringify(bookingData?.allergies || []),
  dietaryPreferences: JSON.stringify(
    bookingData?.dietaryPreferences || [],
  ),

  specialRequests: String(
    bookingData?.specialRequests || "",
  ),

  distanceMiles: String(bookingData?.distanceMiles || 0),
  travelFee: String(bookingData?.travelFee || 0),
  estimatedTotal: String(bookingData?.estimatedTotal || 0),
},
    });

    if (!session.url) {
      return NextResponse.json(
        {
          error: "Stripe did not return a payment URL.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create Stripe Checkout Session.",
      },
      { status: 500 },
    );
  }
}