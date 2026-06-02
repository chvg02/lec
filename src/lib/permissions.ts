export const USER_PERMISSION_KEYS = [
  "canManageProjects",
  "canManageNews",
  "canManageEvents",
  "canManageResources",
  "canManageUsers",
  "canEditContact",
  "canEditAbout",
] as const;

export type UserPermissionKey = (typeof USER_PERMISSION_KEYS)[number];

export type UserPermissionFlags = Record<UserPermissionKey, boolean>;

export const USER_PERMISSION_LABELS: Record<UserPermissionKey, string> = {
  canManageProjects: "Gerenciar projetos",
  canManageNews: "Gerenciar notícias",
  canManageEvents: "Gerenciar eventos",
  canManageResources: "Gerenciar recursos",
  canManageUsers: "Gerenciar usuários",
  canEditContact: "Editar contato",
  canEditAbout: "Editar página sobre",
};

export const USER_PERMISSION_SELECT = USER_PERMISSION_KEYS.reduce(
  (select, key) => ({ ...select, [key]: true }),
  {} as Record<UserPermissionKey, true>
);

export const EMPTY_USER_PERMISSIONS = USER_PERMISSION_KEYS.reduce(
  (permissions, key) => ({ ...permissions, [key]: false }),
  {} as UserPermissionFlags
);

export type PermissionUser = {
  role?: string | null;
  isActive?: boolean | null;
} & Partial<UserPermissionFlags>;

export function hasPermission(
  user: PermissionUser | null | undefined,
  permission: UserPermissionKey
) {
  if (user?.isActive === false) return false;
  return user?.role === "admin" || Boolean(user?.[permission]);
}

export function hasAnyPermission(
  user: PermissionUser | null | undefined,
  permissions: UserPermissionKey[]
) {
  if (user?.isActive === false) return false;
  return user?.role === "admin" || permissions.some((permission) => Boolean(user?.[permission]));
}

export function getPermissionPayload(input: unknown): UserPermissionFlags {
  const source = input && typeof input === "object" ? input as Record<string, unknown> : {};

  return USER_PERMISSION_KEYS.reduce(
    (permissions, key) => ({
      ...permissions,
      [key]: Boolean(source[key]),
    }),
    {} as UserPermissionFlags
  );
}
