export type GuestStatus = 'CHECKED_IN' | 'CHECKED_OUT';

export interface Guest {
  id: string;
  _id?: string;
  name: string;
  agency: string;
  agency_address?: string;
  purpose: string;
  phone: string;
  host: string;
  ktp_image?: string;
  status: GuestStatus;
  check_in_time: string;
  check_out_time?: string;
  qr_code: string;
  created_at: string;
}
