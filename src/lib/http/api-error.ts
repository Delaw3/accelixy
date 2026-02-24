import { NextResponse } from "next/server";
import { ZodError } from "zod";

type MongoDuplicateKeyError = {
  code?: number;
};

export function handleApiError(err: unknown) {
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        ok: false,
        message: "Validation failed",
        errors: err.flatten(),
      },
      { status: 400 }
    );
  }

  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as MongoDuplicateKeyError).code === 11000
  ) {
    return NextResponse.json(
      { ok: false, message: "Email or username already exists." },
      { status: 409 }
    );
  }

  const message =
    err instanceof Error ? err.message : "Internal server error";

  return NextResponse.json({ ok: false, message }, { status: 500 });
}
