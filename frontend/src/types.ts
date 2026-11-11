export interface User {
  user_id: number;
  name: string;
  email: string;
  role: 'Facility Staff' | 'District Officer' | 'State Officer' | 'National Officer' | 'Administrator';
  facility_id?: number | null;
  district_id?: number | null;
  state_name?: string | null;
  is_active: boolean;
  created_at: string;
  facility_name?: string | null;
  district_name?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface District {
  district_id: number;
  district_name: string;
  state_name: string;
  created_at: string;
  facility_count: number;
}

export interface Facility {
  facility_id: number;
  facility_name: string;
  facility_type: string;
  district_id: number;
  contact_phone?: string | null;
  address?: string | null;
  created_at: string;
  district_name?: string | null;
  state_name?: string | null;
  active_services_count: number;
  total_referrals_sent: number;
}

export interface Service {
  service_id: number;
  service_name: string;
  category: string;
  description?: string | null;
  is_active: boolean;
  facilities_offering: number;
}

export interface FacilityCapacity {
  capacity_id: number;
  facility_id: number;
  service_id: number;
  service_available: boolean;
  specialist_count: number;
  equipment_available: boolean;
  beds_available: number;
  last_updated: string;
  facility_name?: string | null;
  service_name?: string | null;
  district_name?: string | null;
  state_name?: string | null;
  category?: string | null;
}

export interface Referral {
  referral_id: number;
  source_facility_id: number;
  destination_facility_id: number;
  service_id: number;
  created_by: number;
  referral_date: string;
  reason_category: string;
  unavailable_resource?: string | null;
  reason: string;
  status: 'Pending' | 'Accepted' | 'In-Transit' | 'Completed' | 'Declined';
  priority: 'Routine' | 'Urgent' | 'Emergency';
  notes?: string | null;
  created_at: string;
  source_facility_name?: string | null;
  source_district_name?: string | null;
  source_state_name?: string | null;
  destination_facility_name?: string | null;
  destination_district_name?: string | null;
  destination_state_name?: string | null;
  service_name?: string | null;
  service_category?: string | null;
  creator_name?: string | null;
}

export interface SupportingReferral {
  referral_id: number;
  referral_date: string;
  destination_facility_name: string;
  reason_category: string;
  unavailable_resource?: string | null;
  reason: string;
  priority: string;
  status: string;
}

export interface PotentialGapItem {
  gap_id: string;
  facility_id: number;
  facility_name: string;
  district_id: number;
  district_name: string;
  state_name: string;
  service_id: number;
  service_name: string;
  service_category: string;
  shortage_type: string;
  unavailable_resource: string;
  referral_count: number;
  analysis_period: string;
  service_reported_available: boolean;
  specialist_count: number;
  equipment_available: boolean;
  beds_available: number;
  capacity_last_updated?: string | null;
  gap_status: 'Potential Gap' | 'Needs Review' | 'Insufficient Data';
  severity: 'High' | 'Medium' | 'Low';
  flag_reason: string;
  supporting_referrals: SupportingReferral[];
}

export interface GapAnalysisResponse {
  total_gaps_identified: number;
  potential_gaps_count: number;
  needs_review_count: number;
  insufficient_data_count: number;
  specialist_gaps_count: number;
  equipment_gaps_count: number;
  diagnostic_gaps_count: number;
  bed_gaps_count: number;
  threshold_used: number;
  time_window_days: number;
  items: PotentialGapItem[];
}

export interface HeatMapNode {
  id: string;
  name: string;
  facility_id?: number | null;
  facility_type?: string | null;
  parent_region?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  referral_count: number;
  gap_count: number;
  primary_shortage: string;
  shortage_category?: string | null;
  status?: 'Potential Gap' | 'Needs Review' | 'Normal';
  gap_id?: string | null;
  intensity: number; // 0 to 100
}

export interface LevelDashboardResponse {
  level: 'District' | 'State' | 'National';
  region_name: string;
  last_updated: string;
  card_facilities_count: number;
  card_referrals_count: number;
  card_potential_gaps_count: number;
  card_review_facilities_count: number;
  card_top_shortage_resource: string;
  card_top_shortage_count?: number;
  recent_alerts: PotentialGapItem[];
  trends: Array<{
    date: string;
    referral_count: number;
    equipment_referrals?: number;
    specialist_referrals?: number;
    bed_referrals?: number;
    diagnostic_referrals?: number;
    emergency_count?: number;
  }>;
  top_reasons?: Array<{ category: string; count: number }>;
  top_resource_shortages?: Array<{ resource: string; count: number }>;
  facility_comparisons?: Array<{
    facility_id: number;
    facility_name: string;
    facility_type: string;
    total_referrals: number;
    equipment_referrals: number;
    specialist_referrals: number;
    bed_referrals: number;
    diagnostic_referrals: number;
    gap_count: number;
    primary_shortage: string;
    status: string;
  }>;
  top_unavailable_specialists: Array<{ name: string; count: number }>;
  top_unavailable_equipment: Array<{ name: string; count: number }>;
  regional_breakdown: Array<{
    facility_id?: number;
    name: string;
    type?: string;
    state_name?: string;
    referral_count: number;
    gap_count: number;
    primary_shortage: string;
    status: string;
  }>;
  heat_map_nodes: HeatMapNode[];
}

export interface AnalyticsSummary {
  total_referrals: number;
  total_facilities: number;
  total_districts: number;
  total_services: number;
  potential_gaps_count: number;
  pending_referrals: number;
  completed_referrals: number;
  emergency_referrals: number;
}

export interface ActivityLog {
  log_id: number;
  user_id?: number | null;
  user_name?: string | null;
  user_role?: string | null;
  action: string;
  ip_address?: string | null;
  created_at: string;
}

export interface StorageFile {
  filename: string;
  category: string;
  description: string;
  size_bytes: number;
  last_modified: string;
  url: string;
}
