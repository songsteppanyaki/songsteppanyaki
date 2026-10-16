
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

function clean(value: unknown, maxLength = 2000): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    const toEmail = process.env.BOOKING_INQUIRY_EMAIL;

    if (!apiKey || !fromEmail || !toEmail) {
      console.error("Booking inquiry email configuration is missing.");
      return NextResponse.json(
        { error: "Email service is not configured. Please contact us directly." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const name = clean(body.name, 100);
    const phone = clean(body.phone, 30);
    const email = clean(body.email, 254);
    const date = clean(body.date, 20);
    const time = clean(body.time, 20);
    const address = clean(body.address, 300);
    const adults = Number(body.adults);
    const children = Number(body.children);
    const occasion = clean(body.occasion, 100);
    const menu = clean(body.menu);
    const notes = clean(body.notes, 3000);

    if (
      !name ||
      !phone ||
      !date ||
      !time ||
      !address ||
      !Number.isInteger(adults) ||
      !Number.isInteger(children) ||
      adults < 0 ||
      children < 0 ||
      adults + children < 1 ||
      adults > 500 ||
      children > 500
    ) {
      return NextResponse.json(
        { error: "Please check the required fields and guest counts." },
        { status: 400 }
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email || undefined,
      subject: `New Booking Inquiry - ${name} - ${date}`,
      text: [
        "NEW FREE BOOKING INQUIRY",
        "",
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Email: ${email || "Not provided"}`,
        `Event Date: ${date}`,
        `Preferred Time: ${time}`,
        `Address: ${address}`,
        `Adults: ${adults}`,
        `Children ages 5-13: ${children}`,
        `Occasion: ${occasion || "Not specified"}`,
        "",
        "Menu / Protein Preferences:",
        menu || "Not specified",
        "",
        "Additional Details:",
        notes || "None",
        "",
        "This is an inquiry only. No deposit has been collected.",
      ].join("\n"),
    });

    if (result.error) {
      console.error("Booking inquiry email failed:", result.error);
      return NextResponse.json(
        { error: "We could not send your inquiry. Please try again later." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your inquiry has been emailed successfully.",
    });
  } catch (error) {
    console.error("Booking inquiry request failed:", error);
    return NextResponse.json(
      { error: "Unable to submit your inquiry. Please try again." },
      { status: 500 }
    );
  }
}
