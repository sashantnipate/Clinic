export const PERMISSIONS = {
  PATIENTS_READ: "patients.read",
  PATIENTS_WRITE: "patients.write",
  ROLES_MANAGE: "roles.manage",
  DEPARTMENTS_MANAGE: "departments.manage",
  FORMS_MANAGE: "forms.manage",
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];