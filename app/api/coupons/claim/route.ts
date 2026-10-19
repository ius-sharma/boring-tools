import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: "Campaign Inactive", message: "Promotional claims are currently disabled." },
    { status: 400 }
  );
}
