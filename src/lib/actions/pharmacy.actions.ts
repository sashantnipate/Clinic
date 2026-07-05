"use server";

import mongoose from "mongoose";
import { connectToDB } from "@/database/db";
import { PharmacyItem } from "@/database/models/pharmacy.model";
import { verifyJWTString } from "./auth.actions";

export interface PharmacyItemInput {
  name: string;
  stock: number;
  price: number;
  tax: number;
}

function normalizePharmacyItemInput(payload: PharmacyItemInput) {
  const name = payload.name?.trim();
  const stock = Number(payload.stock);
  const price = Number(payload.price);
  const tax = Number(payload.tax);

  if (!name) {
    return { success: false as const, error: "Name of the prescription is required." };
  }

  if (![stock, price, tax].every(Number.isFinite)) {
    return { success: false as const, error: "Stock, price, and tax must be valid numbers." };
  }

  if (stock < 0 || price < 0 || tax < 0) {
    return { success: false as const, error: "Stock, price, and tax cannot be negative." };
  }

  return {
    success: true as const,
    data: { name, stock, price, tax },
  };
}

export async function getPharmacyItems(token: string) {
  try {
    const session = await verifyJWTString(token);
    if (!session || !session.ownerOrgId) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDB();

    const items = await PharmacyItem.find({
      ownerOrgId: new mongoose.Types.ObjectId(session.ownerOrgId),
    })
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      items: JSON.parse(JSON.stringify(items)),
    };
  } catch (error: any) {
    console.error("Failed to fetch pharmacy items:", error);
    return { success: false, error: error.message || "Database fault" };
  }
}

export async function createPharmacyItem(token: string, payload: PharmacyItemInput) {
  try {
    const session = await verifyJWTString(token);
    if (!session || !session.ownerOrgId) {
      return { success: false, error: "Unauthorized" };
    }

    const normalized = normalizePharmacyItemInput(payload);
    if (!normalized.success) return normalized;

    await connectToDB();

    const item = await PharmacyItem.create({
      ownerOrgId: new mongoose.Types.ObjectId(session.ownerOrgId),
      ...normalized.data,
    });

    return {
      success: true,
      item: JSON.parse(JSON.stringify(item)),
    };
  } catch (error: any) {
    console.error("Failed to create pharmacy item:", error);
    return { success: false, error: error.message || "Database fault" };
  }
}

export async function updatePharmacyItem(
  token: string,
  id: string,
  payload: PharmacyItemInput
) {
  try {
    const session = await verifyJWTString(token);
    if (!session || !session.ownerOrgId) {
      return { success: false, error: "Unauthorized" };
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: "Invalid pharmacy item ID format" };
    }

    const normalized = normalizePharmacyItemInput(payload);
    if (!normalized.success) return normalized;

    await connectToDB();

    const item = await PharmacyItem.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        ownerOrgId: new mongoose.Types.ObjectId(session.ownerOrgId),
      },
      normalized.data,
      { new: true }
    );

    if (!item) {
      return { success: false, error: "Pharmacy item not found or access denied." };
    }

    return {
      success: true,
      item: JSON.parse(JSON.stringify(item)),
    };
  } catch (error: any) {
    console.error("Failed to update pharmacy item:", error);
    return { success: false, error: error.message || "Database fault" };
  }
}

export async function deletePharmacyItem(token: string, id: string) {
  try {
    const session = await verifyJWTString(token);
    if (!session || !session.ownerOrgId) {
      return { success: false, error: "Unauthorized" };
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: "Invalid pharmacy item ID format" };
    }

    await connectToDB();

    const result = await PharmacyItem.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
      ownerOrgId: new mongoose.Types.ObjectId(session.ownerOrgId),
    });

    if (result.deletedCount === 0) {
      return { success: false, error: "Pharmacy item not found or access denied." };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete pharmacy item:", error);
    return { success: false, error: error.message || "Database fault" };
  }
}
