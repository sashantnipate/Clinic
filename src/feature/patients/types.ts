export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  createdAt: string;
}

export interface VisibleColumns {
  genderAge: boolean;
  contactInfo: boolean;
  regDate: boolean;
}

export interface GetPatientsParams {
  page?: number;
  limit?: number;
  globalSearch?: string;
  nameFilter?: string;
  genderFilter?: string;
  ageCondition?: "gt" | "lt" | "eq" | "none";
  ageValue?: string;
  contactFilter?: string;
  regDateFilter?: string;
  sortOrder?: "asc" | "desc" | null;
}
