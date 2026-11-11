from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel, Field

# ---------------------------------------------------------
# AUTHENTICATION & TOKENS
# ---------------------------------------------------------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[int] = None
    facility_id: Optional[int] = None
    district_id: Optional[int] = None
    state_name: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

# ---------------------------------------------------------
# USERS
# ---------------------------------------------------------
class UserBase(BaseModel):
    name: str
    email: str
    role: str
    facility_id: Optional[int] = None
    district_id: Optional[int] = None
    state_name: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    facility_id: Optional[int] = None
    district_id: Optional[int] = None
    state_name: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    user_id: int
    created_at: datetime
    facility_name: Optional[str] = None
    district_name: Optional[str] = None

    class Config:
        from_attributes = True

# ---------------------------------------------------------
# DISTRICTS
# ---------------------------------------------------------
class DistrictBase(BaseModel):
    district_name: str
    state_name: str = "Delhi NCR"

class DistrictCreate(DistrictBase):
    pass

class DistrictResponse(DistrictBase):
    district_id: int
    created_at: datetime
    facility_count: Optional[int] = 0

    class Config:
        from_attributes = True

# ---------------------------------------------------------
# FACILITIES
# ---------------------------------------------------------
class FacilityBase(BaseModel):
    facility_name: str
    facility_type: str
    district_id: int
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class FacilityCreate(FacilityBase):
    pass

class FacilityUpdate(BaseModel):
    facility_name: Optional[str] = None
    facility_type: Optional[str] = None
    district_id: Optional[int] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None

class FacilityResponse(FacilityBase):
    facility_id: int
    created_at: datetime
    district_name: Optional[str] = None
    state_name: Optional[str] = None
    active_services_count: Optional[int] = 0
    total_referrals_sent: Optional[int] = 0

    class Config:
        from_attributes = True

# ---------------------------------------------------------
# SERVICES
# ---------------------------------------------------------
class ServiceBase(BaseModel):
    service_name: str
    category: str
    description: Optional[str] = None
    is_active: bool = True

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    service_name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class ServiceResponse(ServiceBase):
    service_id: int
    facilities_offering: Optional[int] = 0

    class Config:
        from_attributes = True

# ---------------------------------------------------------
# FACILITY CAPACITY
# ---------------------------------------------------------
class CapacityBase(BaseModel):
    facility_id: int
    service_id: int
    service_available: bool = True
    specialist_count: int = Field(default=0, ge=0)
    equipment_available: bool = True
    beds_available: int = Field(default=0, ge=0)

class CapacityCreate(CapacityBase):
    pass

class CapacityUpdate(BaseModel):
    service_available: Optional[bool] = None
    specialist_count: Optional[int] = Field(default=None, ge=0)
    equipment_available: Optional[bool] = None
    beds_available: Optional[int] = Field(default=None, ge=0)

class CapacityResponse(CapacityBase):
    capacity_id: int
    last_updated: datetime
    facility_name: Optional[str] = None
    service_name: Optional[str] = None
    district_name: Optional[str] = None
    state_name: Optional[str] = None
    category: Optional[str] = None

    class Config:
        from_attributes = True

# ---------------------------------------------------------
# REFERRALS
# ---------------------------------------------------------
class ReferralBase(BaseModel):
    source_facility_id: int
    destination_facility_id: int
    service_id: int
    referral_date: Optional[date] = None
    reason_category: str = "Equipment Unavailable" # 'Specialist Unavailable', 'Equipment Unavailable', 'Diagnostic Service Unavailable', 'Insufficient Beds', 'Other'
    unavailable_resource: Optional[str] = "Echocardiogram"
    reason: str
    priority: str = "Routine"
    notes: Optional[str] = None

class ReferralCreate(ReferralBase):
    pass

class ReferralUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = None
    destination_facility_id: Optional[int] = None

class ReferralResponse(ReferralBase):
    referral_id: int
    created_by: int
    status: str
    created_at: datetime
    source_facility_name: Optional[str] = None
    source_district_name: Optional[str] = None
    source_state_name: Optional[str] = None
    destination_facility_name: Optional[str] = None
    destination_district_name: Optional[str] = None
    destination_state_name: Optional[str] = None
    service_name: Optional[str] = None
    service_category: Optional[str] = None
    creator_name: Optional[str] = None

    class Config:
        from_attributes = True

# ---------------------------------------------------------
# POTENTIAL HEALTHCARE GAP SPECIFICATION
# ---------------------------------------------------------
class SupportingReferral(BaseModel):
    referral_id: int
    referral_date: date
    destination_facility_name: str
    reason_category: str
    unavailable_resource: Optional[str] = None
    reason: str
    priority: str
    status: str

class PotentialGapItem(BaseModel):
    gap_id: str
    facility_id: int
    facility_name: str
    district_id: int
    district_name: str
    state_name: str
    service_id: int
    service_name: str
    service_category: str
    shortage_type: str # 'Specialist Shortage', 'Equipment Shortage', 'Diagnostic Shortage', 'Bed Shortage'
    unavailable_resource: str # e.g. "Echocardiogram", "Cardiologist", "CT Scanner", "ICU Beds"
    referral_count: int
    analysis_period: str
    service_reported_available: bool
    specialist_count: int
    equipment_available: bool
    beds_available: int
    capacity_last_updated: Optional[datetime] = None
    gap_status: str # "Potential Gap", "Needs Review", "Insufficient Data"
    severity: str # "High", "Medium", "Low"
    flag_reason: str
    supporting_referrals: List[SupportingReferral]

class GapAnalysisResponse(BaseModel):
    total_gaps_identified: int
    potential_gaps_count: int
    needs_review_count: int
    insufficient_data_count: int
    specialist_gaps_count: int
    equipment_gaps_count: int
    diagnostic_gaps_count: int
    bed_gaps_count: int
    threshold_used: int
    time_window_days: int
    items: List[PotentialGapItem]

class AnalyticsSummary(BaseModel):
    total_referrals: int
    total_facilities: int
    total_districts: int
    total_services: int
    potential_gaps_count: int
    pending_referrals: int
    completed_referrals: int
    emergency_referrals: int

# ---------------------------------------------------------
# 3-LEVEL GEOGRAPHICAL AUTHORITY DASHBOARDS
# ---------------------------------------------------------
class HeatMapNode(BaseModel):
    id: str
    name: str
    facility_id: Optional[int] = None
    facility_type: Optional[str] = None
    parent_region: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    referral_count: int
    gap_count: int
    primary_shortage: str
    shortage_category: Optional[str] = "Equipment"
    status: Optional[str] = "Normal" # "Potential Gap", "Needs Review", "Normal"
    gap_id: Optional[str] = None
    intensity: int # 0 to 100

class LevelDashboardResponse(BaseModel):
    level: str # "District", "State", "National"
    region_name: str # e.g. "Central Delhi", "Delhi NCR", "India (National)"
    last_updated: str
    
    # 4-5 core summary cards
    card_facilities_count: int
    card_referrals_count: int
    card_potential_gaps_count: int
    card_review_facilities_count: int
    card_top_shortage_resource: str
    card_top_shortage_count: Optional[int] = 0
    
    # Alert previews
    recent_alerts: List[PotentialGapItem]
    
    # Referral trends (multi-series by category)
    trends: List[dict]
    
    # Analytical breakdown charts
    top_reasons: List[dict] = []
    top_resource_shortages: List[dict] = []
    facility_comparisons: List[dict] = []
    
    # Top shortages breakdown
    top_unavailable_specialists: List[dict] = []
    top_unavailable_equipment: List[dict] = []
    
    # Regional breakdown (Facility-wise for District, District-wise for State, State-wise for National)
    regional_breakdown: List[dict]
    
    # Heat map nodes
    heat_map_nodes: List[HeatMapNode]

# ---------------------------------------------------------
# ACTIVITY LOGS
# ---------------------------------------------------------
class ActivityLogResponse(BaseModel):
    log_id: int
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    user_role: Optional[str] = None
    action: str
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
