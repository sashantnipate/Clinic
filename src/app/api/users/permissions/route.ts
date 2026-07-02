import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/database/db";
import { User } from "@/database/models/user.model";
import { verifyJWTString } from "@/lib/actions/auth.actions";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    
    if (!token) {
      return NextResponse.json({ success: false, error: "Token is missing" }, { status: 401 });
    }

    // Decode securely on the server using your working verifyJWTString action
    const session = await verifyJWTString(token);
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: "Invalid token structure" }, { status: 401 });
    }

    await connectToDB();
    const targetUser = await User.findById(session.userId).select("visibleTabs").lean();

    return NextResponse.json({ 
      success: true, 
      visibleTabs: targetUser?.visibleTabs || [] 
    });
  } catch (error: any) {
    console.error("Permissions API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}