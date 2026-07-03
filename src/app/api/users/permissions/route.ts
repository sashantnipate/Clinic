import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/database/db";
import { User } from "@/database/models/user.model";
import "@/database/models/role.model"; 
import { verifyJWTString } from "@/lib/actions/auth.actions";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    
    if (!token) {
      return NextResponse.json({ success: false, error: "Token missing" }, { status: 401 });
    }

    const session = await verifyJWTString(token);
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    await connectToDB();

    // Fetch user and populate their assigned role structures automatically
    const targetUser = await User.findById(session.userId)
      .select("visibleTabs roleIds")
      .populate({ path: "roleIds", select: "allowedTabs", options: { strictPopulate: false } })
      .lean();

    if (!targetUser) {
      return NextResponse.json({ success: false, error: "User profile not found" }, { status: 404 });
    }

    // Blend role-inherited paths with direct user-level overrides
    const inheritedTabs = targetUser.roleIds?.flatMap((role: any) => role.allowedTabs || []) || [];
    const directOverrides = targetUser.visibleTabs || [];

    const unifiedTabsSet = new Set([...directOverrides, ...inheritedTabs]);

    return NextResponse.json({ 
      success: true, 
      visibleTabs: Array.from(unifiedTabsSet) 
    });
  } catch (error: any) {
    console.error("Permissions API calculation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}