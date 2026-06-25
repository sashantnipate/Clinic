import { connectToDB } from "@/database/db";
import { User } from "@/database/models/user.model";
import { Organization } from "@/database/models/organization.model";
import { Membership } from "@/database/models/membership.model";

export async function syncUser(data: any) {
  await connectToDB();
  const primaryEmail = data.email_addresses?.find(
    (e: any) => e.id === data.primary_email_address_id
  )?.email_address || data.email_addresses?.[0]?.email_address || "";

  const hasGoogleAccount = data.external_accounts?.some((acc: any) => acc.provider === "oauth_google");

  return await User.findOneAndUpdate(
    { clerkId: data.id },
    {
      clerkId: data.id,
      email: primaryEmail,
      username: data.username || undefined,
      firstName: data.first_name,
      lastName: data.last_name,
      imageUrl: data.image_url,
      authProvider: hasGoogleAccount ? "google" : "credentials",
    },
    { upsert: true, new: true }
  );
}

export async function deleteUser(data: any) {
  await connectToDB();
  const user = await User.findOne({ clerkId: data.id });
  if (!user) return;
  await Membership.deleteMany({ userId: user._id });
  await User.deleteOne({ _id: user._id });
}

export async function syncOrganization(data: any) {
  await connectToDB();
  let owner = await User.findOne({ clerkId: data.created_by });

  if (!owner) {
    owner = await User.create({
      clerkId: data.created_by,
      email: `${data.created_by}@placeholder.com`,
      authProvider: 'google',
    });
  }

  return await Organization.findOneAndUpdate(
    { clerkOrgId: data.id },
    {
      clerkOrgId: data.id,
      name: data.name,
      slug: data.slug,
      imageUrl: data.image_url,
      ownerId: owner._id,
    },
    { upsert: true, new: true }
  );
}

export async function deleteOrganization(data: any) {
  await connectToDB();
  const org = await Organization.findOne({ clerkOrgId: data.id });
  if (!org) return;
  await Membership.deleteMany({ orgId: org._id });
  await Organization.deleteOne({ _id: org._id });
}

export async function syncMembership(data: any) {
  await connectToDB();
  const [user, org] = await Promise.all([
    User.findOne({ clerkId: data.public_user_data.user_id }),
    Organization.findOne({ clerkOrgId: data.organization.id }),
  ]);

  if (!user || !org) throw new Error("User or organization not found");

  return await Membership.findOneAndUpdate(
    { clerkMembershipId: data.id },
    {
      clerkMembershipId: data.id,
      userId: user._id,
      orgId: org._id,
      role: data.role,
    },
    { upsert: true, new: true }
  );
}