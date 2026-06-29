// src/lib/actions/auth.actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { connectToDB } from "@/database/db";
import { User } from "@/database/models/user.model";
import { Organization } from "@/database/models/organization.model";
import { getNativeSessionData, createInternalJWTSession } from "@/lib/auth-token";

export async function verifyAndFetchWorkspace() {
  try {
    // 1. Try reading your existing native internal JWT cookie first
    let session = await getNativeSessionData();

    // 2. If it exists, return it immediately (Happy Path)
    if (session) {
      return { success: true, userId: session.userId, ownerOrgId: session.ownerOrgId };
    }

    // 3. FALLBACK: If cookie is missing (e.g. fresh login), check the active Clerk Token synchronously
    const { userId: clerkId, orgId: clerkOrgId } = await auth();

    // If both your internal session AND Clerk are empty, they are truly logged out
    if (!clerkId || !clerkOrgId) {
      return { success: false, authError: true, error: "No active session found." };
    }

    await connectToDB();

    // 4. Resolve internal MongoDB ObjectIds using the live Clerk context tokens
    const [dbUser, dbOrg] = await Promise.all([
      User.findOne({ clerkId }),
      Organization.findOne({ clerkOrgId })
    ]);

    // If webhook hasn't processed the database syncing yet, wait or block gracefully
    if (!dbUser || !dbOrg) {
      return { success: false, authError: false, retry: true, error: "Syncing workspace, please wait..." };
    }

    // 5. Generate and drop the missing JWT cookie synchronously on the server right now!
    const payload = {
      userId: dbUser._id.toString(),
      ownerOrgId: dbOrg._id.toString()
    };
    
    await createInternalJWTSession(payload);

    return { success: true, userId: payload.userId, ownerOrgId: payload.ownerOrgId };
  } catch (error) {
    console.error("Critical native session initialization failure:", error);
    return { success: false, authError: true, error: "Authentication system error encountered." };
  }
}