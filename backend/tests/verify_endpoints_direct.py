import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.database import engine, Base, SessionLocal
from backend.app.seed import seed_database
from backend.app import models, auth
from backend.app.routers.analytics import identify_gaps, get_level_dashboard

print("--- 1. Testing Database & Seed ---", flush=True)
Base.metadata.create_all(bind=engine)
db = SessionLocal()
seed_database(db)

# Verify Districts
dist_count = db.query(models.District).count()
print(f"Districts in DB: {dist_count}", flush=True)
assert dist_count >= 7, "Districts should cover 3-level national hierarchy"

# Verify Facilities
fac_count = db.query(models.Facility).count()
print(f"Facilities in DB: {fac_count}", flush=True)
assert fac_count >= 10, "Facilities count should be at least 10"

# Verify Users & Roles
users = db.query(models.User).all()
print(f"Users in DB: {len(users)}", flush=True)
assert len(users) >= 5, "Users should include District, Staff, State, National, and Admin"
role_pwd_map = {
    "staff@sehatsetu.gov.in": "Staff@123",
    "district@sehatsetu.gov.in": "District@123",
    "state@sehatsetu.gov.in": "State@123",
    "national@sehatsetu.gov.in": "National@123",
    "admin@sehatsetu.gov.in": "Admin@123"
}
for u in users:
    expected_pwd = role_pwd_map.get(u.email, "Admin@123")
    pwd_check = auth.verify_password(expected_pwd, u.password_hash)
    print(f"  User: {u.email} ({u.role}) -> Password valid: {pwd_check}", flush=True)
    assert pwd_check, f"Password verification failed for user {u.email}"

# Verify Capacity
cap_count = db.query(models.FacilityCapacity).count()
print(f"Capacity records: {cap_count}", flush=True)

# Verify Referrals
ref_count = db.query(models.Referral).count()
print(f"Referral records: {ref_count}", flush=True)
assert ref_count >= 76, f"Expected at least 76 referrals, found {ref_count}"

# Verify 50 Echocardiogram Deficit Referrals Test Scenario
echo_refs = db.query(models.Referral).filter(models.Referral.unavailable_resource == "Echocardiogram").all()
print(f"Echocardiogram referrals in DB: {len(echo_refs)}", flush=True)
assert len(echo_refs) == 50, f"Expected exactly 50 Echocardiogram referrals, found {len(echo_refs)}"

print("\n--- 2. Testing 3-Level Dashboards & Decision Logic ---", flush=True)
district_user = db.query(models.User).filter(models.User.email == "district@sehatsetu.gov.in").first()
state_user = db.query(models.User).filter(models.User.email == "state@sehatsetu.gov.in").first()
national_user = db.query(models.User).filter(models.User.email == "national@sehatsetu.gov.in").first()

# District Level
dist_dash = get_level_dashboard(level="District", district_id=1, state_name=None, days=90, db=db, current_user=district_user)
print(f"District Dashboard: {dist_dash.region_name} | Facilities: {dist_dash.card_facilities_count} | Referrals: {dist_dash.card_referrals_count} | Gaps: {dist_dash.card_potential_gaps_count} | Top: {dist_dash.card_top_shortage_resource}")
assert dist_dash.card_facilities_count >= 3
assert len(dist_dash.heat_map_nodes) >= 3

# State Level
state_dash = get_level_dashboard(level="State", district_id=None, state_name="Delhi NCR", days=90, db=db, current_user=state_user)
print(f"State Dashboard: {state_dash.region_name} | Facilities: {state_dash.card_facilities_count} | Referrals: {state_dash.card_referrals_count} | Gaps: {state_dash.card_potential_gaps_count}")
assert state_dash.card_facilities_count >= 7
assert len(state_dash.heat_map_nodes) >= 5

# National Level
nat_dash = get_level_dashboard(level="National", district_id=None, state_name=None, days=90, db=db, current_user=national_user)
print(f"National Dashboard: {nat_dash.region_name} | Facilities: {nat_dash.card_facilities_count} | Referrals: {nat_dash.card_referrals_count} | Gaps: {nat_dash.card_potential_gaps_count}")
assert nat_dash.card_facilities_count >= 10
assert len(nat_dash.heat_map_nodes) >= 3

# Evidence Inspection Test
gaps = identify_gaps(threshold=3, days=90, db=db, current_user=district_user)
echo_gap = next((g for g in gaps.items if "Paharganj" in g.facility_name and g.unavailable_resource == "Echocardiogram"), None)
assert echo_gap is not None, "Echocardiogram gap for CHC Paharganj must exist!"
assert echo_gap.referral_count == 50, f"Expected 50 referrals in echo gap, got {echo_gap.referral_count}"
assert len(echo_gap.supporting_referrals) == 50, f"Expected 50 supporting referral records, got {len(echo_gap.supporting_referrals)}"
print(f"\nTest Scenario SUCCESS: CHC Paharganj Equipment Gap identified with all {len(echo_gap.supporting_referrals)} inspectable evidence records!")

db.close()
print("\n--- ALL DIRECT DATABASE, BUSINESS LOGIC, AND TEST SCENARIO CHECKS PASSED ---", flush=True)
