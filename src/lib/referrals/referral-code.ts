import User from "@/lib/models/user.model";

const PREFIX = "ACCX";
const ALPHANUM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;
const MAX_ATTEMPTS = 20;

function randomCodePart(length: number) {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * ALPHANUM.length);
    out += ALPHANUM[index];
  }
  return out;
}

function buildCode() {
  return `${PREFIX}-${randomCodePart(CODE_LENGTH)}`;
}

export async function generateReferralCode() {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const candidate = buildCode();
    const exists = await User.exists({ referralCode: candidate });
    if (!exists) {
      return candidate;
    }
  }

  throw new Error("Unable to generate a unique referral code");
}
