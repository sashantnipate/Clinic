import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { connectToDB } from "@/database/db";
import { User } from "@/database/models/user.model";
import { Organization } from "@/database/models/organization.model";
import { Membership } from "@/database/models/membership.model";
import { deleteOrganization, deleteUser, syncMembership, syncOrganization, syncUser } from "@/lib/actions/clerk.actions";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);
    await connectToDB();

    const data = evt.data as any;

    switch (evt.type) {
      case "user.created":
      case "user.updated":
        await syncUser(data);
        break;

      case "user.deleted":
        await deleteUser(data);
        break;

      case "organization.created":
      case "organization.updated":
        await syncOrganization(data);
        break;

      case "organization.deleted":
        await deleteOrganization(data);
        break;

      case "organizationMembership.created":
      case "organizationMembership.updated":
        await syncMembership(data);
        break;

      case "organizationMembership.deleted":
        await Membership.deleteOne({ clerkMembershipId: data.id });
        break;

      default:
        console.log("Ignored event:", evt.type);
    }

    return new Response("Database sync complete", { status: 200 });
  } catch (error) {
    console.error("Webhook sync failed:", error);
    return new Response("Webhook failed", { status: 400 });
  }
}
