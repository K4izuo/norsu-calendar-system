export const ROLE_CONFIG = {
  1: {
    name: 'dean',
    label: 'Dean',
    path: 'dean',
  },
  2: {
    name: 'staff',
    label: 'Staff',
    path: 'staff',
  },
  3: {
    name: 'admin',
    label: 'Admin',
    path: 'admin',
  },
} as const;

export type RoleNumber = 1 | 2 | 3;
export type RolePath = 'dean' | 'staff' | 'admin';

export function getRolePathFromNumber(roleNum: number): RolePath {
  const role = ROLE_CONFIG[roleNum as RoleNumber];
  return role?.path || 'admin';
}

export function getRoleLabelFromNumber(roleNum: number): string {
  const role = ROLE_CONFIG[roleNum as RoleNumber];
  return role?.label || 'User';
}

export function isValidRole(role: string): role is RolePath {
  return ['dean', 'staff', 'admin'].includes(role);
}