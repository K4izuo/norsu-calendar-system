export const ROLE_CONFIG = {
  1:  { name: 'dean',             label: 'Dean',             path: 'dean',             defaultPage: 'calendar' },
  2:  { name: 'staff',            label: 'Staff',            path: 'staff',            defaultPage: 'calendar' },
  3:  { name: 'admin',            label: 'Admin',            path: 'admin',            defaultPage: 'dashboard' },
  4:  { name: 'student-director', label: 'Student Director', path: 'student-director', defaultPage: 'calendar' },
  5:  { name: 'campus-director',  label: 'Campus Director',  path: 'campus-director',  defaultPage: 'calendar' },
  6:  { name: 'vpaa',             label: 'VPAA',             path: 'vpaa',             defaultPage: 'calendar' },
  7:  { name: 'vpsas',            label: 'VPSAS',            path: 'vpsas',            defaultPage: 'calendar' },
  8:  { name: 'vpaf',             label: 'VPAF',             path: 'vpaf',             defaultPage: 'calendar' },
  9:  { name: 'vprde',            label: 'VPRDE',            path: 'vprde',            defaultPage: 'calendar' },
  10: { name: 'head',             label: 'Head of Office',   path: 'head',             defaultPage: 'calendar' },
} as const;

export type RoleNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type RolePath =
  | 'dean' | 'staff' | 'admin'
  | 'student-director' | 'campus-director'
  | 'vpaa' | 'vpsas' | 'vpaf' | 'vprde' | 'head';

export function getRolePathFromNumber(roleNum: number): RolePath {
  const role = ROLE_CONFIG[roleNum as RoleNumber];
  return (role?.path as RolePath) || 'admin';
}

export function getDefaultPageForRole(roleNum: number): string {
  const role = ROLE_CONFIG[roleNum as RoleNumber];
  return role?.defaultPage || 'calendar';
}

export function getRoleLabelFromNumber(roleNum: number): string {
  const role = ROLE_CONFIG[roleNum as RoleNumber];
  return role?.label || 'User';
}

export function isValidRole(role: string): role is RolePath {
  return Object.values(ROLE_CONFIG).some(r => r.path === role);
}
