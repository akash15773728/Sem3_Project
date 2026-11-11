/*
SEHAT-SETU QUERY FILE
Database engine: Azure SQL Database / Microsoft SQL Server (T-SQL)
Run SEHAT_SETU_RDBMS_Schema.sql first, then run this file in the same database.
The demo data below is synthetic. The password_hash value is a placeholder and is
NOT a valid login credential; replace it with a real bcrypt/Argon2 hash before
using the seeded account for authentication testing.
*/
---THIS is our rough schema actual one in code can diffferr

/* ============================================================
   A. OPTIONAL SYNTHETIC DEMO DATA (safe to re-run for these names)
   ============================================================ */
IF NOT EXISTS (
    SELECT 1 FROM dbo.districts
    WHERE district_name = N'Demo North' AND state_name = N'Uttar Pradesh'
)
    INSERT INTO dbo.districts (district_name, state_name)
    VALUES (N'Demo North', N'Uttar Pradesh');

IF NOT EXISTS (
    SELECT 1 FROM dbo.districts
    WHERE district_name = N'Demo South' AND state_name = N'Uttar Pradesh'
)
    INSERT INTO dbo.districts (district_name, state_name)
    VALUES (N'Demo South', N'Uttar Pradesh');

DECLARE @NorthDistrictId INT = (
    SELECT district_id FROM dbo.districts
    WHERE district_name = N'Demo North' AND state_name = N'Uttar Pradesh'
);
DECLARE @SouthDistrictId INT = (
    SELECT district_id FROM dbo.districts
    WHERE district_name = N'Demo South' AND state_name = N'Uttar Pradesh'
);

IF NOT EXISTS (SELECT 1 FROM dbo.facilities WHERE district_id = @NorthDistrictId AND facility_name = N'Demo PHC North')
    INSERT INTO dbo.facilities (facility_name, facility_type, district_id)
    VALUES (N'Demo PHC North', N'PHC', @NorthDistrictId);

IF NOT EXISTS (SELECT 1 FROM dbo.facilities WHERE district_id = @NorthDistrictId AND facility_name = N'Demo District Hospital North')
    INSERT INTO dbo.facilities (facility_name, facility_type, district_id)
    VALUES (N'Demo District Hospital North', N'District Hospital', @NorthDistrictId);

IF NOT EXISTS (SELECT 1 FROM dbo.facilities WHERE district_id = @SouthDistrictId AND facility_name = N'Demo CHC South')
    INSERT INTO dbo.facilities (facility_name, facility_type, district_id)
    VALUES (N'Demo CHC South', N'CHC', @SouthDistrictId);

IF NOT EXISTS (SELECT 1 FROM dbo.services WHERE service_name = N'Cardiology')
    INSERT INTO dbo.services (service_name, category) VALUES (N'Cardiology', N'Specialty');
IF NOT EXISTS (SELECT 1 FROM dbo.services WHERE service_name = N'Radiology')
    INSERT INTO dbo.services (service_name, category) VALUES (N'Radiology', N'Diagnostics');
IF NOT EXISTS (SELECT 1 FROM dbo.services WHERE service_name = N'General Medicine')
    INSERT INTO dbo.services (service_name, category) VALUES (N'General Medicine', N'Specialty');

DECLARE @PHCId INT = (
    SELECT facility_id FROM dbo.facilities
    WHERE district_id = @NorthDistrictId AND facility_name = N'Demo PHC North'
);
DECLARE @HospitalId INT = (
    SELECT facility_id FROM dbo.facilities
    WHERE district_id = @NorthDistrictId AND facility_name = N'Demo District Hospital North'
);
DECLARE @CHCId INT = (
    SELECT facility_id FROM dbo.facilities
    WHERE district_id = @SouthDistrictId AND facility_name = N'Demo CHC South'
);
DECLARE @CardiologyId INT = (SELECT service_id FROM dbo.services WHERE service_name = N'Cardiology');
DECLARE @RadiologyId INT = (SELECT service_id FROM dbo.services WHERE service_name = N'Radiology');
DECLARE @MedicineId INT = (SELECT service_id FROM dbo.services WHERE service_name = N'General Medicine');

IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = N'demo.staff@sehat-setu.local')
    INSERT INTO dbo.users (full_name, email, password_hash, role, facility_id)
    VALUES (N'Demo Facility Staff', N'demo.staff@sehat-setu.local',
            N'REPLACE_WITH_REAL_PASSWORD_HASH', N'FacilityStaff', @PHCId);

DECLARE @DemoUserId INT = (SELECT user_id FROM dbo.users WHERE email = N'demo.staff@sehat-setu.local');

/* Facility-capacity data is deliberately recorded separately from referrals.
   A capacity row marked unavailable is evidence to review, not final proof of a gap. */
IF NOT EXISTS (SELECT 1 FROM dbo.facility_capacity WHERE facility_id = @PHCId AND service_id = @CardiologyId)
    INSERT INTO dbo.facility_capacity
        (facility_id, service_id, service_available, specialist_count, equipment_available, beds_available)
    VALUES (@PHCId, @CardiologyId, 0, 0, 0, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.facility_capacity WHERE facility_id = @PHCId AND service_id = @RadiologyId)
    INSERT INTO dbo.facility_capacity
        (facility_id, service_id, service_available, specialist_count, equipment_available, beds_available)
    VALUES (@PHCId, @RadiologyId, 0, 0, 0, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.facility_capacity WHERE facility_id = @HospitalId AND service_id = @CardiologyId)
    INSERT INTO dbo.facility_capacity
        (facility_id, service_id, service_available, specialist_count, equipment_available, beds_available)
    VALUES (@HospitalId, @CardiologyId, 1, 3, 1, 8);

IF NOT EXISTS (SELECT 1 FROM dbo.facility_capacity WHERE facility_id = @HospitalId AND service_id = @RadiologyId)
    INSERT INTO dbo.facility_capacity
        (facility_id, service_id, service_available, specialist_count, equipment_available, beds_available)
    VALUES (@HospitalId, @RadiologyId, 1, 2, 1, 5);

IF NOT EXISTS (SELECT 1 FROM dbo.facility_capacity WHERE facility_id = @CHCId AND service_id = @MedicineId)
    INSERT INTO dbo.facility_capacity
        (facility_id, service_id, service_available, specialist_count, equipment_available, beds_available)
    VALUES (@CHCId, @MedicineId, 1, 2, 1, 6);

/* Seed three recent cardiology referrals so the basic gap query can be tested. */
IF NOT EXISTS (SELECT 1 FROM dbo.referrals WHERE source_facility_id = @PHCId AND service_id = @CardiologyId AND reason = N'Demo cardiology referral A')
    INSERT INTO dbo.referrals (source_facility_id, destination_facility_id, service_id, created_by, referral_date, reason, status)
    VALUES (@PHCId, @HospitalId, @CardiologyId, @DemoUserId, DATEADD(day, -2, CONVERT(date, GETDATE())), N'Demo cardiology referral A', N'Referred');
IF NOT EXISTS (SELECT 1 FROM dbo.referrals WHERE source_facility_id = @PHCId AND service_id = @CardiologyId AND reason = N'Demo cardiology referral B')
    INSERT INTO dbo.referrals (source_facility_id, destination_facility_id, service_id, created_by, referral_date, reason, status)
    VALUES (@PHCId, @HospitalId, @CardiologyId, @DemoUserId, DATEADD(day, -7, CONVERT(date, GETDATE())), N'Demo cardiology referral B', N'Accepted');
IF NOT EXISTS (SELECT 1 FROM dbo.referrals WHERE source_facility_id = @PHCId AND service_id = @CardiologyId AND reason = N'Demo cardiology referral C')
    INSERT INTO dbo.referrals (source_facility_id, destination_facility_id, service_id, created_by, referral_date, reason, status)
    VALUES (@PHCId, @HospitalId, @CardiologyId, @DemoUserId, DATEADD(day, -12, CONVERT(date, GETDATE())), N'Demo cardiology referral C', N'Referred');

IF NOT EXISTS (SELECT 1 FROM dbo.referrals WHERE source_facility_id = @PHCId AND service_id = @RadiologyId AND reason = N'Demo radiology referral A')
    INSERT INTO dbo.referrals (source_facility_id, destination_facility_id, service_id, created_by, referral_date, reason, status)
    VALUES (@PHCId, @HospitalId, @RadiologyId, @DemoUserId, DATEADD(day, -4, CONVERT(date, GETDATE())), N'Demo radiology referral A', N'Referred');

IF NOT EXISTS (SELECT 1 FROM dbo.activity_logs WHERE user_id = @DemoUserId AND action = N'Created synthetic demo referrals')
    INSERT INTO dbo.activity_logs (user_id, action)
    VALUES (@DemoUserId, N'Created synthetic demo referrals');
GO

/* ============================================================
   B. JOIN QUERY: Referral details with source, destination and service
   ============================================================ */
SELECT
    r.referral_id,
    r.referral_date,
    src.facility_name AS source_facility,
    dst.facility_name AS destination_facility,
    s.service_name,
    r.reason,
    r.status
FROM dbo.referrals AS r
INNER JOIN dbo.facilities AS src
    ON src.facility_id = r.source_facility_id
INNER JOIN dbo.facilities AS dst
    ON dst.facility_id = r.destination_facility_id
INNER JOIN dbo.services AS s
    ON s.service_id = r.service_id
ORDER BY r.referral_date DESC, r.referral_id DESC;
GO

/* ============================================================
   C. ANALYTICS JOIN: Referral counts by district, facility and service
   ============================================================ */
SELECT
    d.district_name,
    f.facility_name AS source_facility,
    s.service_name,
    COUNT_BIG(*) AS referral_count
FROM dbo.referrals AS r
INNER JOIN dbo.facilities AS f
    ON f.facility_id = r.source_facility_id
INNER JOIN dbo.districts AS d
    ON d.district_id = f.district_id
INNER JOIN dbo.services AS s
    ON s.service_id = r.service_id
GROUP BY d.district_name, f.facility_name, s.service_name
ORDER BY referral_count DESC, d.district_name, f.facility_name;
GO

/* ============================================================
   D. BASIC POTENTIAL-GAP QUERY (last 30 days)
   Three referrals is a demo threshold, not a clinical rule.
   Missing capacity is labelled as missing data, not a confirmed gap.
   ============================================================ */
WITH ReferralCounts AS (
    SELECT
        f.facility_id,
        f.facility_name,
        d.district_name,
        s.service_id,
        s.service_name,
        COUNT_BIG(*) AS referrals_last_30_days,
        MAX(c.capacity_id) AS capacity_id,
        MAX(CONVERT(INT, c.service_available)) AS service_available,
        MAX(c.specialist_count) AS specialist_count,
        MAX(CONVERT(INT, c.equipment_available)) AS equipment_available
    FROM dbo.referrals AS r
    INNER JOIN dbo.facilities AS f
        ON f.facility_id = r.source_facility_id
    INNER JOIN dbo.districts AS d
        ON d.district_id = f.district_id
    INNER JOIN dbo.services AS s
        ON s.service_id = r.service_id
    LEFT JOIN dbo.facility_capacity AS c
        ON c.facility_id = f.facility_id
       AND c.service_id = s.service_id
    WHERE r.referral_date >= DATEADD(day, -30, CONVERT(date, GETDATE()))
    GROUP BY f.facility_id, f.facility_name, d.district_name, s.service_id, s.service_name
)
SELECT
    district_name,
    facility_name AS source_facility,
    service_name,
    referrals_last_30_days,
    specialist_count,
    equipment_available,
    CASE
        WHEN capacity_id IS NULL THEN N'CAPACITY DATA MISSING - REVIEW'
        WHEN service_available = 0 THEN N'SERVICE REPORTED UNAVAILABLE - REVIEW'
        WHEN specialist_count = 0 THEN N'NO SPECIALISTS REPORTED - REVIEW'
        WHEN equipment_available = 0 THEN N'EQUIPMENT REPORTED UNAVAILABLE - REVIEW'
        ELSE N'NO RULE-BASED GAP FLAG'
    END AS evidence_flag
FROM ReferralCounts
WHERE referrals_last_30_days >= 3
  AND (
      capacity_id IS NULL
      OR service_available = 0
      OR specialist_count = 0
      OR equipment_available = 0
  )
ORDER BY referrals_last_30_days DESC;
GO

/* ============================================================
   E. VIEW: Referral totals by status (used by a dashboard)
   ============================================================ */
CREATE OR ALTER VIEW dbo.vw_referral_count_by_status
AS
    SELECT status, COUNT_BIG(*) AS referral_count
    FROM dbo.referrals
    GROUP BY status;
GO

SELECT status, referral_count
FROM dbo.vw_referral_count_by_status
ORDER BY status;
GO

/* ============================================================
   F. STORED PROCEDURE: Referrals sourced from a selected district
   ============================================================ */
CREATE OR ALTER PROCEDURE dbo.GetReferralsByDistrict
    @DistrictId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        r.referral_id,
        r.referral_date,
        src.facility_name AS source_facility,
        dst.facility_name AS destination_facility,
        s.service_name,
        r.reason,
        r.status
    FROM dbo.referrals AS r
    INNER JOIN dbo.facilities AS src
        ON src.facility_id = r.source_facility_id
    INNER JOIN dbo.facilities AS dst
        ON dst.facility_id = r.destination_facility_id
    INNER JOIN dbo.services AS s
        ON s.service_id = r.service_id
    WHERE src.district_id = @DistrictId
    ORDER BY r.referral_date DESC, r.referral_id DESC;
END;
GO

/* Example procedure call for the synthetic district. */
DECLARE @DemoNorthDistrictId INT = (
    SELECT district_id FROM dbo.districts
    WHERE district_name = N'Demo North' AND state_name = N'Uttar Pradesh'
);
EXEC dbo.GetReferralsByDistrict @DistrictId = @DemoNorthDistrictId;
GO

/* ============================================================
   G. TRANSACTION: Update one synthetic demo referral safely
   This demonstrates BEGIN / COMMIT / ROLLBACK. Do not use the demo
   update against production records.
   ============================================================ */
DECLARE @DemoReferralId INT = (
    SELECT TOP (1) referral_id
    FROM dbo.referrals
    WHERE reason = N'Demo cardiology referral A'
    ORDER BY referral_id
);

IF @DemoReferralId IS NOT NULL
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        UPDATE dbo.referrals
        SET status = N'Accepted'
        WHERE referral_id = @DemoReferralId;

        IF @@ROWCOUNT <> 1
            THROW 50001, 'Expected to update exactly one demo referral.', 1;

        COMMIT TRANSACTION;
        PRINT 'Demo referral status updated and transaction committed.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END
ELSE
BEGIN
    PRINT 'Demo referral was not found. Run the optional synthetic demo data section first.';
END;
GO

/* ============================================================
   H. INDEX NOTE
   Search/filter indexes are created in the schema script. Key examples:
   referral_date; source_facility_id + service_id + referral_date;
   destination_facility_id + referral_date; status + referral_date;
   activity-log user_id + created_at. Unique constraints index common lookup keys.
   ============================================================ */
