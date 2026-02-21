const VIEWER_PERMISSIONS = [
  'view_dashboard',
  'view_profile',
  'view_donors',
  'view_donations',
  'view_activities'
]

const STAFF_PERMISSIONS = [
  ...VIEWER_PERMISSIONS,
  'edit_profile',
  'create_donors',
  'edit_donors',
  'create_donations',
  'edit_donations'
]

const ADMIN_BASE_PERMISSIONS = [
  ...STAFF_PERMISSIONS,
  'view_admin_dashboard',
  'manage_users',
  'manage_org_data',
  'access_settings',
  'view_analytics',
  'manage_integrations',
  'view_audit_logs'
]

const ROLE_PERMISSION_MAP = {
  viewer: VIEWER_PERMISSIONS,
  staff: STAFF_PERMISSIONS,
  admin: ADMIN_BASE_PERMISSIONS,
  'admin-org': [...ADMIN_BASE_PERMISSIONS],
  'admin-super': [...ADMIN_BASE_PERMISSIONS],
  'admin-finance': [...ADMIN_BASE_PERMISSIONS, 'manage_finance', 'manage_donations'],
  'admin-campaign': [...ADMIN_BASE_PERMISSIONS, 'manage_campaigns']
}

export function normalizeRole(rawRole) {
  if (!rawRole) return 'viewer'

  const role = String(rawRole).toLowerCase()

  if (role === 'admin') return 'admin'
  if (role === 'staff') return 'staff'
  if (role === 'viewer') return 'viewer'
  if (role.startsWith('admin-')) return role

  return 'viewer'
}

export function permissionsForRole(role) {
  const normalizedRole = normalizeRole(role)
  return ROLE_PERMISSION_MAP[normalizedRole] || VIEWER_PERMISSIONS
}

export function resolvePermissions(role, explicitPermissions) {
  const rolePermissions = permissionsForRole(role)

  if (!Array.isArray(explicitPermissions) || explicitPermissions.length === 0) {
    return [...new Set(rolePermissions)]
  }

  return [...new Set([...rolePermissions, ...explicitPermissions])]
}

export function toUserContext(user) {
  if (!user) return null

  const role = normalizeRole(user.role)
  const permissions = resolvePermissions(role, user.permissions)

  return {
    id: user.userId || user.id,
    userId: user.userId || user.id,
    orgId: user.orgId || user.organizationId || user.organization?.id || null,
    organizationId: user.orgId || user.organizationId || user.organization?.id || null,
    role,
    permissions,
    email: user.email || null,
    name: user.name || null,
    organization: user.organization || null,
    sessionId: user.sessionId || null
  }
}

export function isAdminRole(role) {
  const normalizedRole = normalizeRole(role)
  return normalizedRole === 'admin' || normalizedRole.startsWith('admin-')
}

export function hasPermission(userContext, permission) {
  if (!userContext || !permission) return false
  return userContext.permissions.includes(permission)
}

export function hasAnyPermission(userContext, permissions = []) {
  if (!userContext || permissions.length === 0) return false
  return permissions.some((permission) => hasPermission(userContext, permission))
}

export function requireSameOrg(userContext, requestedOrgId) {
  if (!userContext?.orgId) return false
  if (!requestedOrgId) return true
  return requestedOrgId === userContext.orgId
}
