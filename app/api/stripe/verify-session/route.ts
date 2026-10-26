import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 }
      );
    }

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Missing Supabase environment variables");

      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // 从 Stripe 服务器确认付款状态
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const paid =
      session.mode === "payment" &&
      session.status === "complete" &&
      session.payment_status === "paid";

    if (!paid) {
      return NextResponse.json({
        paid: false,
        sessionId: session.id,
        monthlyOrderNumber: null,
      });
    }

    // 仅在服务器端使用 service_role key
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // 创建订单编号；若此 Stripe Session 已有编号，
    // 数据库函数会返回原编号，不会重复编号。
    const { data, error } = await supabase.rpc(
      "create_monthly_booking_order",
      {
        p_stripe_session_id: session.id,
      }
    );

    if (error) {
      console.error("Failed to create monthly order:", error);

      return NextResponse.json(
        { error: "Unable to retrieve order number" },
        { status: 500 }
      );
    }

    const order = Array.isArray(data) ? data[0] : data;

    if (!order?.result_order_number) {
      console.error("Order number missing from Supabase response");

      return NextResponse.json(
        { error: "Order number not available" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      paid: true,
      sessionId: session.id,
      monthlyOrderNumber: order.result_order_number,
    });
  } catch (error) {
    console.error("Failed to verify Stripe session:", error);

    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}