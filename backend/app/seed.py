import datetime
from sqlalchemy.orm import Session
from backend.app import models, auth

def seed_database(db: Session):
    # Check if database already has 50-referral test scenario
    if db.query(models.Referral).count() >= 50:
        print("Database already contains enriched seed data. Skipping re-seed.")
        return

    # Clear existing data to cleanly seed 3-level national hierarchy and 50-referral test scenario
    print("Beginning seeding of 3-Level Geographic Hierarchy and 50 Echocardiogram Referral Test Scenario...")
    db.query(models.ActivityLog).delete()
    db.query(models.Referral).delete()
    db.query(models.FacilityCapacity).delete()
    db.query(models.User).delete()
    db.query(models.Facility).delete()
    db.query(models.Service).delete()
    db.query(models.District).delete()
    db.commit()

    # 1. SEED DISTRICTS (Covering Delhi NCR, Maharashtra, Karnataka for 3-Level National Hierarchy)
    districts_data = [
        # Delhi NCR
        {"district_name": "Central Delhi", "state_name": "Delhi NCR"},
        {"district_name": "South Delhi", "state_name": "Delhi NCR"},
        {"district_name": "North Delhi", "state_name": "Delhi NCR"},
        {"district_name": "East Delhi", "state_name": "Delhi NCR"},
        {"district_name": "New Delhi", "state_name": "Delhi NCR"},
        # Maharashtra
        {"district_name": "Mumbai Suburban", "state_name": "Maharashtra"},
        {"district_name": "Pune", "state_name": "Maharashtra"},
        # Karnataka
        {"district_name": "Bengaluru Urban", "state_name": "Karnataka"}
    ]
    created_districts = {}
    for d in districts_data:
        dist = models.District(**d)
        db.add(dist)
        db.flush()
        created_districts[d["district_name"]] = dist
    db.commit()

    # 2. SEED FACILITIES (With verified geographical coordinates)
    facilities_data = [
        # Central Delhi
        {"facility_name": "CHC Paharganj (Hospital A)", "facility_type": "Community Health Centre (CHC)", "district_id": created_districts["Central Delhi"].district_id, "contact_phone": "+91-11-23589920", "address": "Paharganj Market Road, Central Delhi", "latitude": 28.6432, "longitude": 77.2155},
        {"facility_name": "PHC Daryaganj", "facility_type": "Primary Health Centre (PHC)", "district_id": created_districts["Central Delhi"].district_id, "contact_phone": "+91-11-23214501", "address": "Daryaganj, Central Delhi", "latitude": 28.6480, "longitude": 77.2420},
        {"facility_name": "District Hospital Central", "facility_type": "District Hospital (DH)", "district_id": created_districts["Central Delhi"].district_id, "contact_phone": "+91-11-23841100", "address": "Civil Lines, Central Delhi", "latitude": 28.6360, "longitude": 77.2390},
        
        # South Delhi
        {"facility_name": "CHC Mehrauli", "facility_type": "Community Health Centre (CHC)", "district_id": created_districts["South Delhi"].district_id, "contact_phone": "+91-11-26643210", "address": "Qutub Green Road, Mehrauli, South Delhi", "latitude": 28.5180, "longitude": 77.1850},
        {"facility_name": "SDH Kalkaji", "facility_type": "Sub-District Hospital (SDH)", "district_id": created_districts["South Delhi"].district_id, "contact_phone": "+91-11-26219080", "address": "Kalkaji Main Rd, South Delhi", "latitude": 28.5385, "longitude": 77.2580},
        {"facility_name": "District Hospital Saket", "facility_type": "District Hospital (DH)", "district_id": created_districts["South Delhi"].district_id, "contact_phone": "+91-11-26514433", "address": "Press Enclave Marg, Saket, South Delhi", "latitude": 28.5240, "longitude": 77.2120},

        # New Delhi
        {"facility_name": "Apex Medical College Hospital New Delhi", "facility_type": "Tertiary Care / Medical College", "district_id": created_districts["New Delhi"].district_id, "contact_phone": "+91-11-26588500", "address": "Ansari Nagar, New Delhi", "latitude": 28.5672, "longitude": 77.2100},

        # Maharashtra (Mumbai & Pune)
        {"facility_name": "Sub-District Hospital Bandra", "facility_type": "Sub-District Hospital (SDH)", "district_id": created_districts["Mumbai Suburban"].district_id, "contact_phone": "+91-22-26421000", "address": "Bandra West, Mumbai", "latitude": 19.0596, "longitude": 72.8295},
        {"facility_name": "District Hospital Pune", "facility_type": "District Hospital (DH)", "district_id": created_districts["Pune"].district_id, "contact_phone": "+91-20-26127000", "address": "Aundh, Pune", "latitude": 18.5580, "longitude": 73.8070},

        # Karnataka (Bengaluru)
        {"facility_name": "CHC Yelahanka", "facility_type": "Community Health Centre (CHC)", "district_id": created_districts["Bengaluru Urban"].district_id, "contact_phone": "+91-80-28561000", "address": "Yelahanka Old Town, Bengaluru", "latitude": 13.1007, "longitude": 77.5963}
    ]
    created_facilities = {}
    for f in facilities_data:
        fac = models.Facility(**f)
        db.add(fac)
        db.flush()
        created_facilities[f["facility_name"]] = fac
    db.commit()

    # 3. SEED SERVICES
    services_data = [
        {"service_name": "Cardiology", "category": "Specialized Medicine", "description": "Interventional cardiology, echocardiograms, stress tests, CCU monitoring"},
        {"service_name": "Neurology & Neurosurgery", "category": "Specialized Medicine", "description": "Stroke management, EEG, neurological evaluation"},
        {"service_name": "Radiology (CT / MRI)", "category": "Diagnostic & Imaging", "description": "Computed Tomography, Magnetic Resonance Imaging, Ultrasonography"},
        {"service_name": "Orthopaedics & Trauma", "category": "Surgical Specialties", "description": "Fracture reduction, joint arthroplasty, polytrauma stabilization"},
        {"service_name": "Maternal & Child Health (MCH)", "category": "Maternal & Child Health", "description": "Comprehensive emergency obstetric and newborn care, NICU"},
        {"service_name": "Emergency & Critical Care (ICU)", "category": "Emergency & Critical Care", "description": "Advanced mechanical ventilation, hemodynamic resuscitation"},
        {"service_name": "General Medicine", "category": "General Services", "description": "Outpatient consultation, infectious disease triage, chronic disease care"},
        {"service_name": "Pathology & Biochemistry", "category": "Diagnostic & Imaging", "description": "Automated blood biochemistry, hematology, microbiological cultures"}
    ]
    created_services = {}
    for s in services_data:
        srv = models.Service(**s)
        db.add(srv)
        db.flush()
        created_services[s["service_name"]] = srv
    db.commit()

    # 4. SEED 5 ROLE ACCOUNTS (Staff, District, State, National, Administrator)
    users_data = [
        {
            "name": "Dr. Sunita Sharma",
            "email": "staff@sehatsetu.gov.in",
            "password_hash": auth.get_password_hash("Staff@123"),
            "role": "Facility Staff",
            "facility_id": created_facilities["CHC Paharganj (Hospital A)"].facility_id,
            "district_id": created_districts["Central Delhi"].district_id,
            "state_name": "Delhi NCR"
        },
        {
            "name": "Rajesh Varma, CMO",
            "email": "district@sehatsetu.gov.in",
            "password_hash": auth.get_password_hash("District@123"),
            "role": "District Officer",
            "facility_id": None,
            "district_id": created_districts["Central Delhi"].district_id,
            "state_name": "Delhi NCR"
        },
        {
            "name": "Dr. Ananya Sen, State Director",
            "email": "state@sehatsetu.gov.in",
            "password_hash": auth.get_password_hash("State@123"),
            "role": "State Officer",
            "facility_id": None,
            "district_id": None,
            "state_name": "Delhi NCR"
        },
        {
            "name": "Dr. Vikramaditya Rathore, DGHS",
            "email": "national@sehatsetu.gov.in",
            "password_hash": auth.get_password_hash("National@123"),
            "role": "National Officer",
            "facility_id": None,
            "district_id": None,
            "state_name": None # Nationwide
        },
        {
            "name": "System Administrator",
            "email": "admin@sehatsetu.gov.in",
            "password_hash": auth.get_password_hash("Admin@123"),
            "role": "Administrator",
            "facility_id": None,
            "district_id": None,
            "state_name": None
        }
    ]
    created_users = {}
    for u in users_data:
        usr = models.User(**u)
        db.add(usr)
        db.flush()
        created_users[u["role"]] = usr
    db.commit()

    # 5. SEED CAPACITY MATRIX
    # Scenario: CHC Paharganj (Hospital A) declared equipment_available = False for Cardiology (Echocardiogram equipment missing)
    for fac_name, fac in created_facilities.items():
        for srv_name, srv in created_services.items():
            service_avail = True
            spec_count = 2
            equip_avail = True
            beds_avail = 15

            if "Hospital A" in fac_name:
                if srv_name == "Cardiology":
                    # KEY TEST SCENARIO: Echocardiogram is UNAVAILABLE
                    service_avail = True
                    spec_count = 1 # Has visiting physician
                    equip_avail = False # Echocardiogram probe broken/unavailable!
                    beds_avail = 2
                elif srv_name == "Radiology (CT / MRI)":
                    service_avail = True
                    spec_count = 1
                    equip_avail = False # CT scanner under repair
                    beds_avail = 0
                elif srv_name == "Emergency & Critical Care (ICU)":
                    service_avail = False
                    spec_count = 0
                    equip_avail = False
                    beds_avail = 0
            elif "Mehrauli" in fac_name:
                if srv_name == "Neurology & Neurosurgery":
                    service_avail = False
                    spec_count = 0 # Specialist deficit!
                    equip_avail = False
                    beds_avail = 0
            elif "PHC" in fac_name:
                if srv_name not in ["General Medicine", "Pathology & Biochemistry"]:
                    service_avail = False
                    spec_count = 0
                    equip_avail = False
                    beds_avail = 0
            elif "District Hospital" in fac_name:
                spec_count = 5
                beds_avail = 40
            elif "Tertiary" in fac_name or "Apex" in fac_name:
                spec_count = 15
                beds_avail = 90

            cap = models.FacilityCapacity(
                facility_id=fac.facility_id,
                service_id=srv.service_id,
                service_available=service_avail,
                specialist_count=spec_count,
                equipment_available=equip_avail,
                beds_available=beds_avail,
                last_updated=datetime.datetime.utcnow() - datetime.timedelta(days=14)
            )
            db.add(cap)
    db.commit()

    # 6. SEED REFERRALS
    # MANDATORY TEST SCENARIO (Section 2 & Section 13):
    # Hospital A in Central Delhi records 50 referrals over three months because echocardiogram equipment is unavailable!
    pahar_fac = created_facilities["CHC Paharganj (Hospital A)"]
    dh_central_fac = created_facilities["District Hospital Central"]
    apex_fac = created_facilities["Apex Medical College Hospital New Delhi"]
    cardio_srv = created_services["Cardiology"]
    staff_user = created_users["Facility Staff"]

    print("Generating 50 synthetic echocardiogram equipment deficit referrals for CHC Paharganj...")
    for i in range(1, 51):
        # Stagger referral dates across last 90 days (3 months)
        days_ago = int((i * 1.7) % 88) + 1
        ref_date = datetime.date.today() - datetime.timedelta(days=days_ago)
        prio = "Emergency" if i % 4 == 0 else "Urgent" if i % 2 == 0 else "Routine"
        status = "Completed" if days_ago > 10 else "In-Transit" if days_ago > 3 else "Pending"
        dest_fac = dh_central_fac if i % 3 != 0 else apex_fac

        ref = models.Referral(
            source_facility_id=pahar_fac.facility_id,
            destination_facility_id=dest_fac.facility_id,
            service_id=cardio_srv.service_id,
            created_by=staff_user.user_id,
            referral_date=ref_date,
            reason_category="Equipment Unavailable",
            unavailable_resource="Echocardiogram",
            reason=f"Patient #{1000 + i} requires 2D echocardiogram evaluation; local echo machine unavailable/under repair.",
            status=status,
            priority=prio,
            notes=f"Clinical test scenario case #{i}: Referred due to certified echocardiogram equipment deficit.",
            created_at=datetime.datetime.combine(ref_date, datetime.time(9 + (i % 8), 15))
        )
        db.add(ref)

    # Add other representative referrals for other shortages & regions
    other_scenarios = [
        # CHC Paharganj -> Radiology CT/MRI (8 cases)
        {"src": pahar_fac.facility_id, "dst": dh_central_fac.facility_id, "srv": created_services["Radiology (CT / MRI)"].service_id, "cat": "Equipment Unavailable", "res": "CT Scanner", "reason": "Non-contrast head CT required for trauma; tube malfunctioning.", "count": 8},
        # CHC Mehrauli -> Neurology Specialist Shortage (6 cases)
        {"src": created_facilities["CHC Mehrauli"].facility_id, "dst": created_facilities["District Hospital Saket"].facility_id, "srv": created_services["Neurology & Neurosurgery"].service_id, "cat": "Specialist Unavailable", "res": "Neurologist", "reason": "Refractory seizures; facility has 0 credentialed neurologists in position.", "count": 6},
        # CHC Paharganj -> ICU Bed Shortage (5 cases)
        {"src": pahar_fac.facility_id, "dst": apex_fac.facility_id, "srv": created_services["Emergency & Critical Care (ICU)"].service_id, "cat": "Insufficient Beds", "res": "ICU Bed", "reason": "Severe ARDS requiring mechanical ventilation; 0 staffed ICU beds available.", "count": 5},
        # Mumbai SDH Bandra -> Diagnostic Shortage (4 cases)
        {"src": created_facilities["Sub-District Hospital Bandra"].facility_id, "dst": created_facilities["District Hospital Pune"].facility_id, "srv": created_services["Radiology (CT / MRI)"].service_id, "cat": "Diagnostic Service Unavailable", "res": "MRI Scanner", "reason": "Suspected spinal compression; MRI unavailable.", "count": 4},
        # Bengaluru CHC Yelahanka -> Specialist Shortage (3 cases)
        {"src": created_facilities["CHC Yelahanka"].facility_id, "dst": created_facilities["District Hospital Central"].facility_id, "srv": created_services["Orthopaedics & Trauma"].service_id, "cat": "Specialist Unavailable", "res": "Orthopaedic Surgeon", "reason": "Complex pelvic fracture; orthopaedic surgeon post vacant.", "count": 3}
    ]

    for sc in other_scenarios:
        for j in range(sc["count"]):
            days_ago = (j * 7) + 2
            ref_date = datetime.date.today() - datetime.timedelta(days=days_ago)
            ref = models.Referral(
                source_facility_id=sc["src"],
                destination_facility_id=sc["dst"],
                service_id=sc["srv"],
                created_by=staff_user.user_id,
                referral_date=ref_date,
                reason_category=sc["cat"],
                unavailable_resource=sc["res"],
                reason=sc["reason"],
                status="Completed" if days_ago > 14 else "Pending",
                priority="Urgent",
                notes="Synthetically generated referral evidence for shortage analysis.",
                created_at=datetime.datetime.combine(ref_date, datetime.time(11, 0))
            )
            db.add(ref)

    db.commit()

    # 7. SEED ACTIVITY LOGS
    auth.log_activity(db, "System initialized with 3-tier geographical hierarchy and 50 echocardiogram referrals test scenario.", user_id=created_users["Administrator"].user_id)
    auth.log_activity(db, "District Officer Rajesh Varma reviewed Central Delhi equipment alerts.", user_id=created_users["District Officer"].user_id)
    auth.log_activity(db, "National Officer Dr. Vikramaditya Rathore accessed National Shortage Heat Map.", user_id=created_users["National Officer"].user_id)

    total_refs = db.query(models.Referral).count()
    print(f"Seeding completed successfully! Total referrals in database: {total_refs} (including 50 echocardiogram equipment deficit records).")

if __name__ == "__main__":
    from backend.app.database import SessionLocal
    db = SessionLocal()
    seed_database(db)
    db.close()
