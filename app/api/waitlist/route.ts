import { NextRequest, NextResponse } from "next/server";
import { appendFile, mkdir } from "fs/promises";
import path from "path";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const WAITLIST_FILE = path.join(DATA_DIR, "waitlist.jsonl");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const toolId = typeof body.toolId === "string" ? body.toolId.trim() : "general";
    const toolName = typeof body.toolName === "string" ? body.toolName.trim() : "BoringTools";

    if (!email || !email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        { error: "INVALID_EMAIL", message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const entry = {
      id: crypto.randomUUID(),
      email,
      toolId,
      toolName,
      source: "tool_gatekeeper_modal",
      createdAt: new Date().toISOString(),
    };

    // 1. Persist to local JSONL file (bulletproof local storage)
    try {
      await mkdir(DATA_DIR, { recursive: true });
      await appendFile(WAITLIST_FILE, JSON.stringify(entry) + "\n", "utf8");
    } catch (fsErr) {
      console.warn("Waitlist local fs save warning:", fsErr);
    }

    // 2. Persist to Supabase waitlist table if table exists
    try {
      const admin = createAdminClient();
      await admin.from("waitlist").insert({
        email: entry.email,
        tool_id: entry.toolId,
        metadata: { tool_name: entry.toolName, source: entry.source },
      });
    } catch {
      // Gracefully catch if table is not yet provisioned in Postgres
    }

    return NextResponse.json({
      success: true,
      message: "You're on the priority waitlist! We'll notify you when access opens.",
    });
  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { error: "SERVER_ERROR", message: "Failed to join waitlist. Please try again." },
      { status: 500 }
    );
  }
}
