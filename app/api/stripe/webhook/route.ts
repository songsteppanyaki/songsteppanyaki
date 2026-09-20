import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { google } from "googleapis";
import fs from "fs";
import path from "path";

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

      const guests = JSON.parse(
        metadata.guests || "[]",
      );

      const proteins = JSON.parse(
        metadata.proteins || "[]",
      );

      const addOns = JSON.parse(
        metadata.addOns || "[]",
      );

      const allergies = JSON.parse(
        metadata.allergies || "[]",
      );

      const dietaryPreferences = JSON.parse(
        metadata.dietaryPreferences || "[]",
      );

      const subtotal = Number(
        metadata.subtotal || 0,
      );

      const salesTax = Number(
        metadata.salesTax || 0,
      );

      const salesTaxRate = Number(
        metadata.salesTaxRate || 0,
      );

      const estimatedTotal = Number(
        metadata.estimatedTotal || 0,
      );

      const depositPaid = Number(
        metadata.depositAmount || 100,
      );

      const remainingBalance = Math.max(
        estimatedTotal - depositPaid,
        0,
      );

      const depositPolicy =
        metadata.depositPolicy ||
         "Refundable if canceled at least 48 hours before the scheduled event start time, subject to a 10% cancellation fee. Non-refundable within 48 hours of the scheduled event start time.";

      // ==========================================
      // 1. EMAIL TO SONG TEPPANYAKI
      // ==========================================

      await resend.emails.send({
        from: "Song Teppanyaki <booking@songsteppanyaki.com>",
        to: "songsteppanyaki@gmail.com",
        subject: "New Booking - Deposit Received",
        html: `
          <h2>New Song Teppanyaki Booking</h2>

          <h3>Customer</h3>

          <p>
            <strong>Name:</strong>
            ${metadata.fullName || "N/A"}
          </p>

          <p>
            <strong>Phone:</strong>
            ${metadata.phone || "N/A"}
          </p>

          <p>
            <strong>Email:</strong>
            ${metadata.email || email || "N/A"}
          </p>

          <h3>Event</h3>

          <p>
            <strong>Date:</strong>
            ${metadata.eventDate || "N/A"}
          </p>

          <p>
            <strong>Time:</strong>
            ${metadata.eventTime || "N/A"}
          </p>

          <p>
            <strong>Occasion:</strong>
            ${metadata.occasion || "N/A"}
          </p>

          <p>
            <strong>Address:</strong>
            ${metadata.address || "N/A"}
          </p>

          <p>
            <strong>City:</strong>
            ${metadata.city || "N/A"}
          </p>

          <p>
            <strong>ZIP Code:</strong>
            ${metadata.zipCode || "N/A"}
          </p>

          <h3>Guests</h3>

          <p>
            <strong>Total Guests:</strong>
            ${metadata.totalGuests || "0"}
          </p>

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
            <strong>Subtotal:</strong>
            $${subtotal.toFixed(2)}
          </p>

          <p>
           <strong>Sales Tax (${(salesTaxRate * 100).toFixed(2)}%):</strong>
            $${salesTax.toFixed(2)}
          </p>

          <p>
            <strong>Estimated Total:</strong>
            $${estimatedTotal.toFixed(2)}
          </p>

          <p>
            <strong>Deposit Paid:</strong>
            $${depositPaid.toFixed(2)}
          </p>

          <p>
            <strong>Remaining Balance:</strong>
            $${remainingBalance.toFixed(2)}
          </p>

          <h3>Deposit Policy</h3>

          <p>
            ${depositPolicy}
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
          from: "Song Teppanyaki <booking@songsteppanyaki.com>",
          to: email,
          subject: "Song Teppanyaki Booking Confirmation",
          html: `
            <h2>Thank You for Choosing Song Teppanyaki!</h2>

            <p>
              We received your booking request and your
              $${depositPaid.toFixed(2)} booking deposit.
            </p>

            <p>
              <strong>Event Date:</strong>
              ${metadata.eventDate || "N/A"}
            </p>

            <p>
              <strong>Event Time:</strong>
              ${metadata.eventTime || "N/A"}
            </p>

            <p>
              <strong>Event Address:</strong>
              ${metadata.address || "N/A"}
            </p>

            <p>
              <strong>Estimated Total:</strong>
              $${estimatedTotal.toFixed(2)}
            </p>

            <p>
              <strong>Deposit Paid:</strong>
              $${depositPaid.toFixed(2)}
            </p>

            <p>
              <strong>Remaining Balance:</strong>
              $${remainingBalance.toFixed(2)}
            </p>

            <h3>Deposit Refund Policy</h3>

            <p>
              Your $${depositPaid.toFixed(2)} booking deposit is
              Refundable if canceled at least 48 hours before the scheduled event start time, subject to a 10% cancellation fee..
            </p>

            <p>
              Cancellations made within 48 hours of the scheduled
              event start time are non-refundable.
            </p>

            <p>
              Your booking is not fully confirmed until
              Song Teppanyaki reviews your event details.
            </p>

            <p>
              Thank you!
            </p>

            <p>
              <strong>Song Teppanyaki</strong>
            </p>
          `,
        });
      }

      // ==========================================
      // 3. GOOGLE CALENDAR
      // ==========================================

      const calendarId =
        process.env.GOOGLE_CALENDAR_ID;

      const googleCredentialsBase64 =
        process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;

      let credentials: any = null;

      // Prefer the environment variable.
      // For local development, fall back to the JSON file in the project root.
      if (googleCredentialsBase64) {
        credentials = JSON.parse(
          Buffer.from(
            googleCredentialsBase64,
            "base64",
          ).toString("utf8"),
        );
      } else {
        const credentialsPath = path.join(
          process.cwd(),
          "google-calendar-key.json",
        );

        if (fs.existsSync(credentialsPath)) {
          credentials = JSON.parse(
            fs.readFileSync(credentialsPath, "utf8"),
          );
        }
      }

      if (
        credentials &&
        calendarId &&
        metadata.eventDate
      ) {

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

Address: ${metadata.address || "N/A"}
City: ${metadata.city || "N/A"}
ZIP Code: ${metadata.zipCode || "N/A"}

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

Distance: ${metadata.distanceMiles || "0"} miles
Travel Fee: $${metadata.travelFee || "0"}

Subtotal: $${subtotal.toFixed(2)}
Sales Tax (${salesTaxRate.toFixed(2)}%): $${salesTax.toFixed(2)}
Estimated Total: $${estimatedTotal.toFixed(2)}

Deposit Paid: $${depositPaid.toFixed(2)}
Remaining Balance: $${remainingBalance.toFixed(2)}
Please note: Chef tips are not included in the estimated total. Tips are voluntary and typically range from 20%-30% of the meal total, based on your satisfaction with the chef's service.


Deposit Policy:
${depositPolicy}

Special Requests:
${metadata.specialRequests || "None"}
        `.trim();

        if (metadata.eventTime) {
          // Customer-selected start time.
          // Event duration is exactly 1 hour 30 minutes.
          //
          // eventTime is expected to be HH:mm, e.g. "17:00".
          const [hours, minutes] = String(
            metadata.eventTime,
          )
            .split(":")
            .map(Number);

          if (
            Number.isNaN(hours) ||
            Number.isNaN(minutes)
          ) {
            console.error(
              "Google Calendar event not created: invalid eventTime.",
              metadata.eventTime,
            );
          } else {
            const totalStartMinutes =
              hours * 60 + minutes;

            const totalEndMinutes =
              totalStartMinutes + 90;

            const endHours =
              Math.floor(totalEndMinutes / 60) % 24;

            const endMinutes =
              totalEndMinutes % 60;

            const startDateTime =
              `${metadata.eventDate}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;

            let endDate = metadata.eventDate;

            if (totalEndMinutes >= 24 * 60) {
              const nextDay = new Date(
                `${metadata.eventDate}T12:00:00Z`,
              );

              nextDay.setUTCDate(
                nextDay.getUTCDate() + 1,
              );

              endDate = nextDay
                .toISOString()
                .slice(0, 10);
            }

            const endDateTime =
              `${endDate}T${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}:00`;

            console.log(
              "Creating Google Calendar event:",
              {
                startDateTime,
                endDateTime,
                calendarId,
                duration: "90 minutes",
              },
            );

            try {
              const calendarEvent =
                await calendar.events.insert({
                  calendarId,
                  requestBody: {
                    summary:
                      `Song Teppanyaki - ${
                        metadata.fullName || "Booking"
                      }`,

                    location:
                      metadata.address || "",

                    description: eventDescription,

                    start: {
                      dateTime: startDateTime,
                      timeZone:
                        "America/Los_Angeles",
                    },

                    end: {
                      dateTime: endDateTime,
                      timeZone:
                        "America/Los_Angeles",
                    },
                  },
                });

              console.log(
                "Google Calendar event created:",
                calendarEvent.data.id,
              );

              console.log(
                "Google Calendar event link:",
                calendarEvent.data.htmlLink,
              );
            } catch (calendarError) {
              console.error(
                "Google Calendar event creation failed:",
                calendarError,
              );
            }
          }
        } else {
          console.error(
            "Google Calendar event not created: eventTime is missing.",
          );
        }
      } else {
        console.error(
          "Google Calendar not configured or eventDate is missing.",
          {
            hasGoogleCredentials:
              Boolean(credentials),
            hasCalendarId: Boolean(calendarId),
            eventDate: metadata.eventDate || "",
          },
        );
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
