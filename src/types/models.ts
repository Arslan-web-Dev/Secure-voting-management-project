export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}

export type ProfileRole = 'super_admin' | 'election_creator' | 'voter';

export type ElectionStatus =
  | 'draft'
  | 'pending_approval'
  | 'published'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type RegistrationStatus =
  | 'pending'
  | 'approved'
  | 'waitlisted'
  | 'rejected';

export interface ProfileRecord {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: ProfileRole;
  organization: string | null;
  election_purpose: string | null;
  is_approved: boolean | null;
  rejection_reason: string | null;
  created_at: string;
}

export interface ElectionRecord {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  category: string | null;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  max_voters: number;
  status: ElectionStatus;
  is_locked: boolean;
  rejection_reason?: string | null;
  created_at: string;
}

export interface CandidateRecord {
  id: string;
  election_id: string;
  name: string;
  photo_url: string | null;
  designation: string | null;
  manifesto: string | null;
  created_at?: string;
}

export interface AuditLogRecord {
  id: string;
  action: string;
  metadata: JsonObject | null;
  ip_address: string | null;
  timestamp: string;
  user_id: string | null;
}
