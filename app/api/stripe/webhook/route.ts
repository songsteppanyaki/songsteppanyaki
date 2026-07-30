import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    if (!signature) return NextResponse.json({error:"Missing Stripe signature"},{status:400});

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email;

      await resend.emails.send({
        from: "Song Teppanyaki <onboarding@resend.dev>",
        to: "songsteppanyaki@gmail.com",
        subject: "New Booking Deposit",
        html: `<h2>Deposit Received</h2><p>Session: ${session.id}</p><p>Email: ${email ?? "N/A"}</p>`
      });

      if (email) {
        await resend.emails.send({
          from: "Song Teppanyaki <onboarding@resend.dev>",
          to: email,
          subject: "Booking Confirmation",
          html: "<h2>Thank you!</h2><p>We received your $200 non-refundable deposit.</p>"
        });
      }
    }

    return NextResponse.json({received:true});
  } catch (e) {
    console.error(e);
    return NextResponse.json({error:"Webhook failed"},{status:400});
  }
}
