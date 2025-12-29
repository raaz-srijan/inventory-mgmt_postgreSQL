const rolesData = [
  { name: "super_admin", level: 1 },
  { name: "admin", level: 2 },
  { name: "owner", level: 3 },
  { name: "manager", level: 4 },
  { name: "staff", level: 5 },
];


const permissionsData = [
  // PLATFORM
  { name: "manage_platform", group: "platform" },
  { name: "view_error_logs", group: "platform" },
  { name: "fix_bugs", group: "platform" },
  { name: "post_global_announcements", group: "platform" },

  // ADMIN
  { name: "verify_business_registration", group: "admin" },
  { name: "approve_owner_accounts", group: "admin" },
  { name: "post_admin_notices", group: "admin" },

  // BUSINESS OWNER
  { name: "manage_business_roles", group: "business" },
  { name: "assign_business_permissions", group: "business" },
  { name: "approve_managers", group: "business" },
  { name: "view_business_dashboard", group: "business" },
  { name: "post_business_notices", group: "business" },

  // MANAGER
  { name: "manage_staff_roles", group: "inventory" },
  { name: "update_inventory", group: "inventory" },
  { name: "view_reports", group: "inventory" },
  { name: "view_manager_dashboard", group: "inventory" },
  { name: "request_permission_changes", group: "inventory" },

  // STAFF
  { name: "view_assigned_inventory", group: "inventory" },
  { name: "update_limited_data", group: "inventory" },
  { name: "view_notices", group: "inventory" },

  // COMMON
  { name: "chat_internal", group: "common" },
  { name: "report_bugs", group: "common" },
];

const rolePermissions = {
  super_admin: [
    "manage_platform",
    "view_error_logs",
    "fix_bugs",
    "post_global_announcements",
    "chat_internal",
  ],

  admin: [
    "verify_business_registration",
    "approve_owner_accounts",
    "post_admin_notices",
    "chat_internal",
  ],

  owner: [
    "manage_business_roles",
    "assign_business_permissions",
    "approve_managers",
    "view_business_dashboard",
    "post_business_notices",
    "chat_internal",
    "report_bugs",
  ],

  manager: [
    "manage_staff_roles",
    "update_inventory",
    "view_reports",
    "view_manager_dashboard",
    "request_permission_changes",
    "chat_internal",
    "report_bugs",
  ],

  staff: [
    "view_assigned_inventory",
    "update_limited_data",
    "view_notices",
    "chat_internal",
    "report_bugs",
  ],
};


module.exports = { rolesData, permissionsData, rolePermissions };