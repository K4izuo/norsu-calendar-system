export interface AccountUser {
  id: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email?: string;
  role: number;
  campus_id?: string;
  created_at?: string;
}

export interface AdminPasswordFormData {
  new_password: string;
  confirm_password: string;
}
