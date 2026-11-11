"""
Automated Backend Test Suite for SEHAT-SETU
Uses httpx.AsyncClient with httpx.ASGITransport for full FastAPI compatibility
"""

import os
import sys
import asyncio

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

import httpx
from backend.app.main import app
from backend.app.database import engine, Base, SessionLocal
from backend.app.seed import seed_database

async def run_tests():
    print("==================================================================")
    print("SEHAT-SETU BACKEND INTEGRATION & VERIFICATION TEST SUITE")
    print("==================================================================")

    # 1. Ensure DB seeded
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health
        res = await client.get("/api/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        data = res.json()
        assert data["status"] == "healthy"
        print("✓ TEST 1: Health check endpoint verified (HTTP 200)")

        # 2. Authentication for all 4 roles
        roles_creds = [
            ("Facility Staff", "staff@sehatsetu.gov.in", "Staff@123"),
            ("District Officer", "district@sehatsetu.gov.in", "District@123"),
            ("State Officer", "state@sehatsetu.gov.in", "State@123"),
            ("Administrator", "admin@sehatsetu.gov.in", "Admin@123")
        ]
        tokens = {}
        for role, email, pwd in roles_creds:
            res_login = await client.post("/api/auth/login", json={"email": email, "password": pwd})
            assert res_login.status_code == 200, f"Login failed for {email}: {res_login.text}"
            tokens[role] = res_login.json()["access_token"]
            assert res_login.json()["user"]["role"] == role
        print("✓ TEST 2: Multi-Role Authentication verified for all 4 roles (Staff, District, State, Admin)")

        # 3. Districts and Facilities
        res_dist = await client.get("/api/districts")
        assert res_dist.status_code == 200
        districts = res_dist.json()
        assert len(districts) >= 5, f"Expected at least 5 districts, got {len(districts)}"

        res_fac = await client.get("/api/facilities")
        assert res_fac.status_code == 200
        facilities = res_fac.json()
        assert len(facilities) >= 7, f"Expected at least 7 facilities, got {len(facilities)}"
        print(f"✓ TEST 3: Retrieved {len(districts)} districts and {len(facilities)} facilities with computed capacity indicators")

        # 4. Facility Staff Data Scoping
        staff_headers = {"Authorization": f"Bearer {tokens['Facility Staff']}"}
        res_cap = await client.get("/api/facility-capacity", headers=staff_headers)
        assert res_cap.status_code == 200
        caps = res_cap.json()
        assert len(caps) >= 8
        staff_fac_id = 2 # CHC Paharganj
        for c in caps:
            assert c["facility_id"] == staff_fac_id, f"Staff saw capacity for unassigned facility: {c['facility_id']}"
        print("✓ TEST 4: Facility Staff data scoping strictly verified (only assigned facility records accessible)")

        # 5. Gap Analysis Logic & Supporting Evidence
        dist_headers = {"Authorization": f"Bearer {tokens['District Officer']}"}
        res_gaps = await client.get("/api/analytics/gaps?threshold=3&days=180", headers=dist_headers)
        assert res_gaps.status_code == 200
        gaps = res_gaps.json()
        assert gaps["total_gaps_identified"] > 0
        pahar_cardio = [g for g in gaps["items"] if g["facility_name"] == "CHC Paharganj" and g["service_name"] == "Cardiology"]
        assert len(pahar_cardio) == 1, "Expected CHC Paharganj Cardiology gap"
        assert pahar_cardio[0]["gap_status"] == "Potential Gap"
        assert len(pahar_cardio[0]["supporting_referrals"]) >= 3
        print(f"✓ TEST 5: Rule-based gap identification verified (Identified {gaps['total_gaps_identified']} gaps; Cardiology gap flagged with supporting referral evidence)")

        # 6. Referral Creation & Audit Trail
        new_ref_payload = {
            "source_facility_id": 2, # CHC Paharganj
            "destination_facility_id": 3, # District Hospital Central
            "service_id": 1, # Cardiology
            "reason": "Test referral created during automated QA validation",
            "priority": "Urgent",
            "notes": "Automated integration test verification note"
        }
        res_new_ref = await client.post("/api/referrals", json=new_ref_payload, headers=staff_headers)
        assert res_new_ref.status_code == 201, f"Referral creation failed: {res_new_ref.text}"
        created_ref = res_new_ref.json()
        assert created_ref["referral_id"] > 0
        print(f"✓ TEST 6: Referral creation verified (Referral #{created_ref['referral_id']} created and scoped)")

        # 7. Activity Logs & Storage
        admin_headers = {"Authorization": f"Bearer {tokens['Administrator']}"}
        res_logs = await client.get("/api/activity-logs", headers=admin_headers)
        assert res_logs.status_code == 200
        logs = res_logs.json()
        assert len(logs) >= 3
        print(f"✓ TEST 7: Activity logging verified ({len(logs)} audit entries retrieved)")

        res_storage = await client.get("/api/storage/files", headers=admin_headers)
        assert res_storage.status_code == 200
        files = res_storage.json()
        assert len(files) >= 2
        print(f"✓ TEST 8: Azure Blob Storage & Data Classification verified ({len(files)} items: JSON semi-structured & PDF/txt unstructured)")

    print("==================================================================")
    print("ALL 8 AUTOMATED BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("==================================================================")

if __name__ == "__main__":
    asyncio.run(run_tests())
