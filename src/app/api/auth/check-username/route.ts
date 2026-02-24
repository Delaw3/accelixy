import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/user.model";

const querySchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9._-]+$/, "Username contains invalid characters"),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.parse({
      username: searchParams.get("username") ?? "",
    });

    await connectDB();

    const username = parsed.username.toLowerCase();
    const exists = await User.exists({ username });

    return NextResponse.json({
      ok: true,
      available: !exists,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        available: false,
      },
      { status: 400 },
    );
  }
}
