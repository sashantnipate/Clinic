import { SidebarTabId } from "@/constants/sidebar-tabs";
import { PermissionKey } from "@/constants/permissions";

export interface UserAccessContext {
  roleIds: string[];
  departmentIds: string[];
  allowedTabs: SidebarTabId[];
  allowedPermissions: PermissionKey[];
  accessMode: "strict" | "shared" | "global";
  isAdmin: boolean;
}