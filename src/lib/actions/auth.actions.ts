"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/database/db";
import { User } from "@/database/models/user.model";
import { Organization } from "@/database/models/organization.model";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.INTERNAL_JWT_SECRET || "super_secure_minimum_32_character_secret_key"
);

export async function getNativeJWTString() {
  try {
    const { userId: clerkId, orgId: clerkOrgId, orgSlug } = await auth();
    if (!clerkId || !clerkOrgId) return { success: false, token: null };

    await connectToDB();

    // 1. Fetch user data safely using an atomic find-and-update upsert to avoid duplicate key race conditions
    const clerkUser = await currentUser();
    const primaryEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || `${clerkId}@placeholder.com`;

    const dbUser = await User.findOneAndUpdate(
      { clerkId },
      {
        $setOnInsert: {
          clerkId,
          email: primaryEmail,
          firstName: clerkUser?.firstName || "",
          lastName: clerkUser?.lastName || "",
          authProvider: "google",
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    // 2. Perform the same atomic upsert configuration for the organization profile row
    const dbOrg = await Organization.findOneAndUpdate(
      { clerkOrgId },
      {
        $setOnInsert: {
          clerkOrgId,
          name: orgSlug || "Clinic Workspace",
          slug: orgSlug || `org-${clerkOrgId}`,
          ownerId: dbUser._id,
        }
      },
      { upsert: true, returnDocument: 'after'}
    );

    // 3. Issue your signature payload securely
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