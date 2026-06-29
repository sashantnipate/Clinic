import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.INTERNAL_JWT_SECRET || "super_secure_minimum_32_character_secret_key"
);

export interface JWTSessionPayload {
  userId: string;
  ownerOrgId: string;
}

export async function createInternalJWTSession(payload: JWTSessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Token valid for 7 days
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set("clinic_session", token, {
    httpOnly: true, // Safeguards against XSS scripting exploits
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // Blocks cross-origin request forgery (CSRF)
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}


export async function getNativeSessionData(): Promise<JWTSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("clinic_session")?.value;

    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      ownerOrgId: payload.ownerOrgId as string,
    };
  } catch (error) {
    console.error("Internal JWT validation decoding error:", error);
    return null;
  }
}


export async function clearInternalSession() {
  const cookieStore = await cookies();
  cookieStore.delete("clinic_session");
}