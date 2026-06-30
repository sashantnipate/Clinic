"use server";

import { auth } from "@clerk/nextjs/server";
import { connectToDB } from "@/database/db";
import { User } from "@/database/models/user.model";
import { Organization } from "@/database/models/organization.model";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.INTERNAL_JWT_SECRET || "super_secure_minimum_32_character_secret_key"
);

// Generates the raw JWT string instantly on the server side
export async function getNativeJWTString() {
  try {
    const { userId: clerkId, orgId: clerkOrgId } = await auth();
    if (!clerkId || !clerkOrgId) return { success: false, token: null };

    await connectToDB();

    const [dbUser, dbOrg] = await Promise.all([
      User.findOne({ clerkId }),
      Organization.findOne({ clerkOrgId })
    ]);

    if (!dbUser || !dbOrg) return { success: false, token: null };

    const token = await new SignJWT({
      userId: dbUser._id.toString(),
      ownerOrgId: dbOrg._id.toString()
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    return { success: true, token };
  } catch (error) {
    console.error("JWT generation crash:", error);
    return { success: false, token: null };
  }
}

//Used inside your database actions to read the passed JWT string
export async function verifyJWTString(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      ownerOrgId: payload.ownerOrgId as string
    };
  } catch (err) {
    return null;
  }
}