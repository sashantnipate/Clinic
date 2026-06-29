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