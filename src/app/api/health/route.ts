import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ ok: true, dbStatus: "connected" });
  } catch (e) {
    return NextResponse.json(
      { ok: false, dbStatus: "error", message: (e as Error).message },
      { status: 500 }
    );
  }
}
