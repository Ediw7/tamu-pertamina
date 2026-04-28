export type GuestStatus = 'checked_in' | 'checked_out';

export interface Guest {
  id: string;
  name: string;
  agency: string;
  purpose: string;
  phone: string;
  host: string;
  status: GuestStatus;
  check_in_time: string;
  check_out_time?: string;
  qr_code: string;
  created_at: string;
}
