import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { google } from "googleapis";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 },
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    if (event.type === "checkout.session.completed") {
      const session =
        event.data.object as Stripe.Checkout.Session;

      const email = session.customer_details?.email;
      const metadata = session.metadata || {};

      const guests = JSON.parse(metadata.guests || "[]");
      const proteins = JSON.parse(metadata.proteins || "[]");
      const addOns = JSON.parse(metadata.addOns || "[]");
      const allergies = JSON.parse(
        metadata.allergies || "[]",
      );
      const dietaryPreferences = JSON.parse(
        metadata.dietaryPreferences || "[]",
      );

      const estimatedTotal = Number(
        metadata.estimatedTotal || 0,
      );

      const depositPaid = 200;

      const remainingBalance = Math.max(
        estimatedTotal - depositPaid,
        0,
      );

      // ==========================================
      // 1. EMAIL TO SONG TEPPANYAKI
      // ==========================================

      await resend.emails.send({
        from: "Song Teppanyaki <onboarding@resend.dev>",
        to: "songsteppanyaki@gmail.com",
        subject: "New Booking - Deposit Received",
        html: `
          <h2>New Song Teppanyaki Booking</h2>

          <h3>Customer</h3>
          <p><strong>Name:</strong> ${
            metadata.fullName || "N/A"
          }</p>
          <p><strong>Phone:</strong> ${
            metadata.phone || "N/A"
          }</p>
          <p><strong>Email:</strong> ${
            metadata.email || email || "N/A"
          }</p>

          <h3>Event</h3>
          <p><strong>Date:</strong> ${
            metadata.eventDate || "N/A"
          }</p>
          <p><strong>Time:</strong> ${
            metadata.eventTime || "N/A"
          }</p>
          <p><strong>Occasion:</strong> ${
            metadata.occasion || "N/A"
          }</p>
          <p><strong>Address:</strong> ${
            metadata.address || "N/A"
          }</p>

          <h3>Guests</h3>
          <p><strong>Total Guests:</strong> ${
            metadata.totalGuests || "0"
          }</p>

          <ul>
            ${
              guests.length
                ? guests
                    .map(
                      (guest: any) =>
                        `<li>${guest.category}: ${guest.quantity}</li>`,
                    )
                    .join("")
                : "<li>None</li>"
            }
          </ul>

          <h3>Proteins</h3>

          <ul>
            ${
              proteins.length
                ? proteins
                    .map(
                      (protein: any) =>
                        `<li>${protein.name}: ${protein.quantity}</li>`,
                    )
                    .join("")
                : "<li>None</li>"
            }
          </ul>

          <h3>Add-ons</h3>

          <ul>
            ${
              addOns.length
                ? addOns
                    .map(
                      (item: any) =>
                        `<li>${item.name} x ${item.quantity} - $${item.subtotal}</li>`,
                    )
                    .join("")
                : "<li>None</li>"
            }
          </ul>

          <h3>Dietary Information</h3>

          <p>
            <strong>Allergies:</strong>
            ${
              allergies.length
                ? allergies.join(", ")
                : "None"
            }
          </p>

          <p>
            <strong>Dietary Preferences:</strong>
            ${
              dietaryPreferences.length
                ? dietaryPreferences.join(", ")
                : "None"
            }
          </p>

          <p>
            <strong>Special Requests:</strong>
            ${metadata.specialRequests || "None"}
          </p>

          <h3>Pricing</h3>

          <p>
            <strong>Distance:</strong>
            ${metadata.distanceMiles || "0"} miles
          </p>

          <p>
            <strong>Travel Fee:</strong>
            $${metadata.travelFee || "0"}
          </p>

          <p>
            <strong>Estimated Total:</strong>
            $${estimatedTotal}
          </p>

          <p>
            <strong>Deposit Paid:</strong>
            $${depositPaid}
          </p>

          <p>
            <strong>Remaining Balance:</strong>
            $${remainingBalance}
          </p>

          <hr />

          <p>
            <strong>Stripe Session:</strong>
            ${session.id}
          </p>
        `,
      });

      // ==========================================
      // 2. EMAIL TO CUSTOMER
      // ==========================================

      if (email) {
        await resend.emails.send({
          from: "Song Teppanyaki <onboarding@resend.dev>",
          to: email,
          subject: "Song Teppanyaki Booking Confirmation",
          html: `
            <h2>Thank You for Choosing Song Teppanyaki!</h2>

            <p>We received your booking request and your $200 non-refundable deposit.</p>

            <p><strong>Event Date:</strong> ${
              metadata.eventDate || "N/A"
            }</p>

            <p><strong>Event Time:</strong> ${
              metadata.eventTime || "N/A"
            }</p>

            <p><strong>Event Address:</strong> ${
              metadata.address || "N/A"
            }</p>

            <p><strong>Estimated Total:</strong> $${estimatedTotal}</p>

            <p><strong>Deposit Paid:</strong> $200</p>

            <p><strong>Remaining Balance:</strong> $${remainingBalance}</p>

            <p>
              Your booking is not fully confirmed until
              Song Teppanyaki reviews your event details.
            </p>

            <p>Thank you!</p>

            <p><strong>Song Teppanyaki</strong></p>
          `,
        });
      }

// ==========================================
// 3. GOOGLE CALENDAR
// ==========================================

const calendarId = process.env.GOOGLE_CALENDAR_ID;

const googleCredentialsBase64 =
  process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;

if (
  googleCredentialsBase64 &&
  calendarId &&
  metadata.eventDate
) {
  const credentials = JSON.parse(
    Buffer.from(
      googleCredentialsBase64,
      "base64",
    ).toString("utf8"),
  );

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/calendar",
    ],
  });

  const calendar = google.calendar({
    version: "v3",
    auth,
  });

  const eventDescription = `
Customer: ${metadata.fullName || "N/A"}
Phone: ${metadata.phone || "N/A"}
Email: ${metadata.email || email || "N/A"}

Guests: ${metadata.totalGuests || "0"}

Proteins:
${
  proteins.length
    ? proteins
        .map(
          (protein: any) =>
            `${protein.name}: ${protein.quantity}`,
        )
        .join("\n")
    : "None"
}

Add-ons:
${
  addOns.length
    ? addOns
        .map(
          (item: any) =>
            `${item.name} x ${item.quantity}`,
        )
        .join("\n")
    : "None"
}

Estimated Total: $${estimatedTotal}
Deposit Paid: $200
Remaining Balance: $${remainingBalance}

Special Requests:
${metadata.specialRequests || "None"}
`.trim();

  if (metadata.eventTime) {
    const startDateTime =
      `${metadata.eventDate}T${metadata.eventTime}:00`;

    // 用 UTC 只做“钟表时间 + 2小时”的计算，
    // 最后仍然交给 Google 按 Los Angeles 时区解释
    const tempDate = new Date(
      `${metadata.eventDate}T${metadata.eventTime}:00Z`,
    );

    tempDate.setUTCHours(
      tempDate.getUTCHours() + 2,
    );

    const endDateTime = tempDate
      .toISOString()
      .slice(0, 19);

    console.log(
      "Creating Google Calendar event:",
      startDateTime,
      endDateTime,
      calendarId,
    );

    const calendarEvent =
      await calendar.events.insert({
        calendarId,
        requestBody: {
          summary:
            `Song Teppanyaki - ${
              metadata.fullName || "Booking"
            }`,

          location: metadata.address || "",

          description: eventDescription,

          start: {
            dateTime: startDateTime,
            timeZone: "America/Los_Angeles",
          },

          end: {
            dateTime: endDateTime,
            timeZone: "America/Los_Angeles",
          },
        },
      });

    console.log(
      "Google Calendar event created:",
      calendarEvent.data.id,
    );
  } else {
    // 如果客户没有填写时间，就创建全天事件

    const startDate = new Date(
      `${metadata.eventDate}T00:00:00Z`,
    );

    startDate.setUTCDate(
      startDate.getUTCDate() + 1,
    );

    const nextDate = startDate
      .toISOString()
      .slice(0, 10);

    const calendarEvent =
      await calendar.events.insert({
        calendarId,
        requestBody: {
          summary:
            `Song Teppanyaki - ${
              metadata.fullName || "Booking"
            }`,

          location: metadata.address || "",

          description: eventDescription,

          start: {
            date: metadata.eventDate,
          },

          end: {
            date: nextDate,
          },
        },
      });

        console.log(
        "Google Calendar event created:",
        calendarEvent.data.id,
      );
    }
  }
}

return NextResponse.json({
  received: true,
});

} catch (e) {
  console.error("Webhook error:", e);

  return NextResponse.json(
    {
      error: "Webhook failed",
    },
    {
      status: 400,
    },
  );
}
}