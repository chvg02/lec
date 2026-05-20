import { createHash, randomBytes } from "crypto";

export const RESET_PASSWORD_TOKEN_TTL_MS = 1000 * 60 * 60;

export function generateResetPasswordToken() {
  return randomBytes(32).toString("hex");
}

export function hashResetPasswordToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getResetPasswordExpirationDate() {
  return new Date(Date.now() + RESET_PASSWORD_TOKEN_TTL_MS);
}
