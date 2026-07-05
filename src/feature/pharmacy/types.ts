export interface PharmacyItem {
  id: string;
  name: string;
  stock: number;
  price: number;
  tax: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PharmacyItemFormValues {
  name: string;
  stock: number;
  price: number;
  tax: number;
}

export type PharmacySortKey = "name" | "stock" | "price" | "tax";
export type PharmacySortDirection = "asc" | "desc";
