import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { valid: false, error: "No promotional campaigns or coupon codes are currently active." },
    { status: 404 }
  );
}
