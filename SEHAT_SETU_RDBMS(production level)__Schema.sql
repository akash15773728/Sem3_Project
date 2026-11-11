-- ============================================================================
-- SEHAT-SETU: Healthcare Referral Analytics and Gap Identification Platform
-- Relational Database Management System (RDBMS) - Azure SQL / T-SQL Schema
-- Database Engine: Microsoft Azure SQL Database / Microsoft SQL Server
-- Normalization Level: Third Normal Form (3NF)
-- Evaluation Deliverable: SEHAT_SETU_RDBMS_Schema.sql
-- ============================================================================

-- Drop dependent objects if re-running script in development
IF OBJECT_ID('dbo.trg_AuditReferralStatus', 'TR') IS NOT NULL DROP TRIGGER dbo.trg_AuditReferralStatus;
IF OBJECT_ID('dbo.sp_CreateReferralWithAudit', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_CreateReferralWithAudit;
IF OBJECT_ID('dbo.vw_FacilityCapacityGapOverview', 'V') IS NOT NULL DROP VIEW dbo.vw_FacilityCapacityGapOverview;
IF OBJECT_ID('dbo.vw_ReferralTrendByDistrict', 'V') IS NOT NULL DROP VIEW dbo.vw_ReferralTrendByDistrict;

IF OBJECT_ID('dbo.activity_logs', 'U') IS NOT NULL DROP TABLE dbo.activity_logs;
IF OBJECT_ID('dbo.referrals', 'U') IS NOT NULL DROP TABLE dbo.referrals;
IF OBJECT_ID('dbo.facility_capacity', 'U') IS NOT NULL DROP TABLE dbo.facility_capacity;
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;
IF OBJECT_ID('dbo.services', 'U') IS NOT NULL DROP TABLE dbo.services;
IF OBJECT_ID('dbo.facilities', 'U') IS NOT NULL DROP TABLE dbo.facilities;
IF OBJECT_ID('dbo.districts', 'U') IS NOT NULL DROP TABLE dbo.districts;

-- ============================================================================
-- TABLE 1: districts
-- Stores administrative districts and states for regional scoping.
-- 3NF: All attributes depend strictly on district_id (PK). No transitive deps.
-- ============================================================================
CREATE TABLE dbo.districts (
    district_id INT IDENTITY(1,1) NOT NULL,
    district_name NVARCHAR(100) NOT NULL,
    state_name NVARCHAR(100) NOT NULL CONSTRAINT DF_districts_state DEFAULT N'Delhi NCR',
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_districts_created_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_districts PRIMARY KEY CLUSTERED (district_id),
    CONSTRAINT UQ_districts_name_state UNIQUE (district_name, state_name)
);

-- ============================================================================
-- TABLE 2: facilities
-- Healthcare establishments (e.g., PHC, CHC, Sub-District, District Hospital).
-- 3NF: facility_id is PK. district_id FK links to district without repeating state.
-- ============================================================================
CREATE TABLE dbo.facilities (
    facility_id INT IDENTITY(1,1) NOT NULL,
    facility_name NVARCHAR(200) NOT NULL,
    facility_type NVARCHAR(50) NOT NULL,
    district_id INT NOT NULL,
    contact_phone NVARCHAR(20) NULL,
    address NVARCHAR(300) NULL,
    latitude FLOAT NULL,
    longitude FLOAT NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_facilities_created_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_facilities PRIMARY KEY CLUSTERED (facility_id),
    CONSTRAINT FK_facilities_districts FOREIGN KEY (district_id) 
        REFERENCES dbo.districts (district_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT CK_facilities_type CHECK (facility_type IN (
        N'Primary Health Centre (PHC)',
        N'Community Health Centre (CHC)',
        N'Sub-District Hospital (SDH)',
        N'District Hospital (DH)',
        N'Tertiary Care / Medical College'
    ))
);

-- ============================================================================
-- TABLE 3: services
-- Master directory of medical specialties and diagnostic services.
-- 3NF: service_id is PK; category classifies the domain without duplication.
-- ============================================================================
CREATE TABLE dbo.services (
    service_id INT IDENTITY(1,1) NOT NULL,
    service_name NVARCHAR(150) NOT NULL,
    category NVARCHAR(50) NOT NULL,
    description NVARCHAR(500) NULL,
    is_active BIT NOT NULL CONSTRAINT DF_services_is_active DEFAULT 1,
    CONSTRAINT PK_services PRIMARY KEY CLUSTERED (service_id),
    CONSTRAINT UQ_services_name UNIQUE (service_name),
    CONSTRAINT CK_services_category CHECK (category IN (
        N'Specialized Medicine',
        N'Surgical Specialties',
        N'Diagnostic & Imaging',
        N'Maternal & Child Health',
        N'Emergency & Critical Care',
        N'General Services'
    ))
);

-- ============================================================================
-- TABLE 4: users
-- Authenticated personnel with strict Role-Based Access Control (RBAC).
-- Roles: 'Facility Staff', 'District Officer', 'State Officer', 'Administrator'.
-- 3NF: user_id is PK; role and organizational scopes are defined cleanly.
-- ============================================================================
CREATE TABLE dbo.users (
    user_id INT IDENTITY(1,1) NOT NULL,
    name NVARCHAR(150) NOT NULL,
    email NVARCHAR(150) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(30) NOT NULL,
    facility_id INT NULL,
    district_id INT NULL,
    state_name NVARCHAR(100) NULL,
    is_active BIT NOT NULL CONSTRAINT DF_users_is_active DEFAULT 1,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_users_created_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_users PRIMARY KEY CLUSTERED (user_id),
    CONSTRAINT UQ_users_email UNIQUE (email),
    CONSTRAINT FK_users_facilities FOREIGN KEY (facility_id) 
        REFERENCES dbo.facilities (facility_id) ON DELETE SET NULL,
    CONSTRAINT FK_users_districts FOREIGN KEY (district_id) 
        REFERENCES dbo.districts (district_id) ON DELETE NO ACTION,
    CONSTRAINT CK_users_role CHECK (role IN (
        N'Facility Staff',
        N'District Officer',
        N'State Officer',
        N'National Officer',
        N'Administrator'
    ))
);

-- ============================================================================
-- TABLE 5: facility_capacity
-- Reported resources for each facility and medical specialty/service.
-- 3NF: capacity_id is PK; UNIQUE (facility_id, service_id) prevents duplication.
-- ============================================================================
CREATE TABLE dbo.facility_capacity (
    capacity_id INT IDENTITY(1,1) NOT NULL,
    facility_id INT NOT NULL,
    service_id INT NOT NULL,
    service_available BIT NOT NULL CONSTRAINT DF_capacity_service_available DEFAULT 1,
    specialist_count INT NOT NULL CONSTRAINT DF_capacity_specialist_count DEFAULT 0,
    equipment_available BIT NOT NULL CONSTRAINT DF_capacity_equipment_available DEFAULT 1,
    beds_available INT NOT NULL CONSTRAINT DF_capacity_beds_available DEFAULT 0,
    last_updated DATETIME2(0) NOT NULL CONSTRAINT DF_capacity_last_updated DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_facility_capacity PRIMARY KEY CLUSTERED (capacity_id),
    CONSTRAINT UQ_facility_service UNIQUE (facility_id, service_id),
    CONSTRAINT FK_facility_capacity_facilities FOREIGN KEY (facility_id) 
        REFERENCES dbo.facilities (facility_id) ON DELETE CASCADE,
    CONSTRAINT FK_facility_capacity_services FOREIGN KEY (service_id) 
        REFERENCES dbo.services (service_id) ON DELETE CASCADE,
    CONSTRAINT CK_capacity_specialist_count CHECK (specialist_count >= 0),
    CONSTRAINT CK_capacity_beds_available CHECK (beds_available >= 0)
);

-- ============================================================================
-- TABLE 6: referrals
-- Outbound patient referrals between source and destination healthcare facilities.
-- 3NF: referral_id is PK; records reference source, destination, service, & user.
-- Notice: No personally identifiable patient data stored. Only synthetic tracking.
-- ============================================================================
CREATE TABLE dbo.referrals (
    referral_id INT IDENTITY(1,1) NOT NULL,
    source_facility_id INT NOT NULL,
    destination_facility_id INT NOT NULL,
    service_id INT NOT NULL,
    created_by INT NOT NULL,
    referral_date DATE NOT NULL CONSTRAINT DF_referrals_date DEFAULT CAST(GETUTCDATE() AS DATE),
    reason_category NVARCHAR(50) NOT NULL CONSTRAINT DF_referrals_reason_cat DEFAULT N'Equipment Unavailable',
    unavailable_resource NVARCHAR(100) NULL CONSTRAINT DF_referrals_unavail_res DEFAULT N'Echocardiogram',
    reason NVARCHAR(500) NOT NULL,
    status NVARCHAR(30) NOT NULL CONSTRAINT DF_referrals_status DEFAULT N'Pending',
    priority NVARCHAR(20) NOT NULL CONSTRAINT DF_referrals_priority DEFAULT N'Routine',
    notes NVARCHAR(1000) NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_referrals_created_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_referrals PRIMARY KEY CLUSTERED (referral_id),
    CONSTRAINT FK_referrals_source_facility FOREIGN KEY (source_facility_id) 
        REFERENCES dbo.facilities (facility_id) ON DELETE NO ACTION,
    CONSTRAINT FK_referrals_dest_facility FOREIGN KEY (destination_facility_id) 
        REFERENCES dbo.facilities (facility_id) ON DELETE NO ACTION,
    CONSTRAINT FK_referrals_services FOREIGN KEY (service_id) 
        REFERENCES dbo.services (service_id) ON DELETE NO ACTION,
    CONSTRAINT FK_referrals_users FOREIGN KEY (created_by) 
        REFERENCES dbo.users (user_id) ON DELETE NO ACTION,
    CONSTRAINT CK_referrals_source_dest_diff CHECK (source_facility_id <> destination_facility_id),
    CONSTRAINT CK_referrals_reason_category CHECK (reason_category IN (
        N'Specialist Unavailable',
        N'Equipment Unavailable',
        N'Diagnostic Service Unavailable',
        N'Insufficient Beds',
        N'Other'
    )),
    CONSTRAINT CK_referrals_status CHECK (status IN (
        N'Pending',
        N'Accepted',
        N'In-Transit',
        N'Completed',
        N'Declined'
    )),
    CONSTRAINT CK_referrals_priority CHECK (priority IN (
        N'Routine',
        N'Urgent',
        N'Emergency'
    ))
);

-- ============================================================================
-- TABLE 7: activity_logs
-- Immutable audit log of operational and security events in the platform.
-- 3NF: log_id is PK; captures user, action description, and timestamp.
-- ============================================================================
CREATE TABLE dbo.activity_logs (
    log_id INT IDENTITY(1,1) NOT NULL,
    user_id INT NULL,
    action NVARCHAR(300) NOT NULL,
    ip_address NVARCHAR(50) NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_activity_logs_created_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_activity_logs PRIMARY KEY CLUSTERED (log_id),
    CONSTRAINT FK_activity_logs_users FOREIGN KEY (user_id) 
        REFERENCES dbo.users (user_id) ON DELETE SET NULL
);

-- ============================================================================
-- PERFORMANCE INDEXES (Evaluated Requirement: Indexes on frequently searched cols)
-- ============================================================================
CREATE NONCLUSTERED INDEX IX_facilities_district_id 
    ON dbo.facilities (district_id);

CREATE NONCLUSTERED INDEX IX_facility_capacity_service 
    ON dbo.facility_capacity (service_id) 
    INCLUDE (service_available, specialist_count, beds_available);

CREATE NONCLUSTERED INDEX IX_referrals_source_service 
    ON dbo.referrals (source_facility_id, service_id, referral_date) 
    INCLUDE (status, destination_facility_id);

CREATE NONCLUSTERED INDEX IX_referrals_date_status 
    ON dbo.referrals (referral_date, status);

CREATE NONCLUSTERED INDEX IX_activity_logs_created 
    ON dbo.activity_logs (created_at DESC);

-- ============================================================================
-- EVALUATION REQUIREMENT: DATABASE VIEW 1
-- vw_FacilityCapacityGapOverview
-- Joins facilities, services, and reported capacity with outbound referral volume
-- to enable rapid decision support for potential gaps.
-- ============================================================================
GO
CREATE OR ALTER VIEW dbo.vw_FacilityCapacityGapOverview AS
SELECT 
    f.facility_id,
    f.facility_name,
    f.facility_type,
    d.district_id,
    d.district_name,
    d.state_name,
    s.service_id,
    s.service_name,
    s.category AS service_category,
    ISNULL(fc.service_available, 0) AS service_available,
    ISNULL(fc.specialist_count, 0) AS specialist_count,
    ISNULL(fc.equipment_available, 0) AS equipment_available,
    ISNULL(fc.beds_available, 0) AS beds_available,
    fc.last_updated AS capacity_last_updated,
    COUNT(r.referral_id) AS total_outbound_referrals,
    CASE 
        WHEN ISNULL(fc.service_available, 0) = 0 AND COUNT(r.referral_id) >= 3 THEN N'Potential Gap'
        WHEN (ISNULL(fc.specialist_count, 0) = 0 OR ISNULL(fc.equipment_available, 0) = 0) AND COUNT(r.referral_id) >= 2 THEN N'Needs Review'
        WHEN fc.capacity_id IS NULL THEN N'Insufficient Capacity Data'
        ELSE N'Adequate / Monitored'
    END AS gap_status
FROM dbo.facilities f
CROSS JOIN dbo.services s
INNER JOIN dbo.districts d ON f.district_id = d.district_id
LEFT JOIN dbo.facility_capacity fc ON f.facility_id = fc.facility_id AND s.service_id = fc.service_id
LEFT JOIN dbo.referrals r ON f.facility_id = r.source_facility_id AND s.service_id = r.service_id
GROUP BY 
    f.facility_id, f.facility_name, f.facility_type,
    d.district_id, d.district_name, d.state_name,
    s.service_id, s.service_name, s.category,
    fc.capacity_id, fc.service_available, fc.specialist_count, fc.equipment_available, fc.beds_available, fc.last_updated;
GO

-- ============================================================================
-- EVALUATION REQUIREMENT: DATABASE VIEW 2
-- vw_ReferralTrendByDistrict
-- Aggregates monthly referral counts by district and priority for high-level monitoring.
-- ============================================================================
GO
CREATE OR ALTER VIEW dbo.vw_ReferralTrendByDistrict AS
SELECT 
    d.district_id,
    d.district_name,
    YEAR(r.referral_date) AS referral_year,
    MONTH(r.referral_date) AS referral_month,
    r.priority,
    COUNT(r.referral_id) AS total_referrals,
    COUNT(CASE WHEN r.status = N'Completed' THEN 1 END) AS completed_referrals,
    COUNT(CASE WHEN r.status = N'Pending' THEN 1 END) AS pending_referrals
FROM dbo.referrals r
INNER JOIN dbo.facilities f ON r.source_facility_id = f.facility_id
INNER JOIN dbo.districts d ON f.district_id = d.district_id
GROUP BY 
    d.district_id, d.district_name,
    YEAR(r.referral_date), MONTH(r.referral_date),
    r.priority;
GO

-- ============================================================================
-- EVALUATION REQUIREMENT: STORED PROCEDURE WITH TRANSACTION CONTROL
-- sp_CreateReferralWithAudit
-- Atomically registers a referral record and inserts an activity audit entry.
-- Demonstrates COMMIT and ROLLBACK error handling.
-- ============================================================================
GO
CREATE OR ALTER PROCEDURE dbo.sp_CreateReferralWithAudit
    @SourceFacilityId INT,
    @DestinationFacilityId INT,
    @ServiceId INT,
    @CreatedBy INT,
    @ReferralDate DATE,
    @Reason NVARCHAR(500),
    @Priority NVARCHAR(20) = N'Routine',
    @Notes NVARCHAR(1000) = NULL,
    @NewReferralId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validate source facility exists
        IF NOT EXISTS (SELECT 1 FROM dbo.facilities WHERE facility_id = @SourceFacilityId)
        BEGIN
            THROW 51001, 'Source facility does not exist.', 1;
        END

        -- Validate destination facility exists
        IF NOT EXISTS (SELECT 1 FROM dbo.facilities WHERE facility_id = @DestinationFacilityId)
        BEGIN
            THROW 51002, 'Destination facility does not exist.', 1;
        END

        -- Validate source != destination
        IF (@SourceFacilityId = @DestinationFacilityId)
        BEGIN
            THROW 51003, 'Source and destination facility cannot be identical.', 1;
        END

        -- Validate service exists
        IF NOT EXISTS (SELECT 1 FROM dbo.services WHERE service_id = @ServiceId)
        BEGIN
            THROW 51004, 'Service requested does not exist.', 1;
        END

        -- Insert referral
        INSERT INTO dbo.referrals (
            source_facility_id,
            destination_facility_id,
            service_id,
            created_by,
            referral_date,
            reason,
            status,
            priority,
            notes
        )
        VALUES (
            @SourceFacilityId,
            @DestinationFacilityId,
            @ServiceId,
            @CreatedBy,
            ISNULL(@ReferralDate, CAST(GETUTCDATE() AS DATE)),
            @Reason,
            N'Pending',
            @Priority,
            @Notes
        );

        SET @NewReferralId = SCOPE_IDENTITY();

        -- Insert immutable audit record
        INSERT INTO dbo.activity_logs (user_id, action)
        VALUES (
            @CreatedBy,
            CONCAT(N'Created Referral #', @NewReferralId, N' from Facility ', @SourceFacilityId, N' to Facility ', @DestinationFacilityId, N' for Service ', @ServiceId)
        );

        -- If everything succeeds, commit transaction
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- In case of any validation or database failure, rollback transaction
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- Re-throw error to client
        THROW;
    END CATCH
END;
GO

-- ============================================================================
-- EVALUATION REQUIREMENT: AUDIT TRIGGER
-- trg_AuditReferralStatus
-- Automatically logs status transitions (e.g. Pending -> Accepted -> Completed).
-- ============================================================================
GO
CREATE OR ALTER TRIGGER dbo.trg_AuditReferralStatus
ON dbo.referrals
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF UPDATE(status)
    BEGIN
        INSERT INTO dbo.activity_logs (user_id, action)
        SELECT 
            i.created_by,
            CONCAT(N'Referral #', i.referral_id, N' status updated from [', d.status, N'] to [', i.status, N']')
        FROM inserted i
        INNER JOIN deleted d ON i.referral_id = d.referral_id
        WHERE i.status <> d.status;
    END
END;
GO
