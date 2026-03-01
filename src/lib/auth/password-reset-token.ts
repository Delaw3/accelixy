import { createHmac, timingSafeEqual } from "crypto";

type PasswordResetTokenPayload = {
  email: string;
  exp: number;
};

function getSecret() {
  return process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "accelixy";
}

function signData(data: string) {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

export function createPasswordResetToken(payload: PasswordResetTokenPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signData(body);
  return `${body}.${signature}`;
}

export function verifyPasswordResetToken(token: string) {
  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }

  const expectedSignature = signData(body);
  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(expectedBuffer, actualBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as PasswordResetTokenPayload;

    if (
      !payload ||
      typeof payload.email !== "string" ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }

    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
