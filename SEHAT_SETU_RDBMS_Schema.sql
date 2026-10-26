/*
SEHAT-SETU RDBMS SCHEMA
Database engine: Azure SQL Database / Microsoft SQL Server (T-SQL)
Run this script once in the target, empty project database.
Scope: referral analytics and facility-capacity gap identification.
Intervention tracking is intentionally out of scope for the first version.
*/
---THIS is our rough schema actual one in code can diffferr
CREATE TABLE dbo.districts (
    district_id   INT IDENTITY(1,1) NOT NULL,
    district_name NVARCHAR(100) NOT NULL,
    state_name    NVARCHAR(100) NOT NULL,
    CONSTRAINT PK_districts PRIMARY KEY (district_id),
    CONSTRAINT UQ_district_name_state UNIQUE (district_name, state_name)
);
GO

CREATE TABLE dbo.facilities (
    facility_id   INT IDENTITY(1,1) NOT NULL,
    facility_name NVARCHAR(150) NOT NULL,
    facility_type NVARCHAR(30) NOT NULL,
    district_id   INT NOT NULL,
    is_active     BIT NOT NULL CONSTRAINT DF_facilities_is_active DEFAULT (1),
    CONSTRAINT PK_facilities PRIMARY KEY (facility_id),
    CONSTRAINT FK_facilities_district
        FOREIGN KEY (district_id) REFERENCES dbo.districts(district_id),
    CONSTRAINT CK_facilities_type
        CHECK (facility_type IN ('PHC', 'CHC', 'District Hospital', 'Medical College', 'Other')),
    CONSTRAINT UQ_facility_name_district UNIQUE (district_id, facility_name)
);
GO

CREATE TABLE dbo.services (
    service_id   INT IDENTITY(1,1) NOT NULL,
    service_name NVARCHAR(120) NOT NULL,
    category     NVARCHAR(60) NOT NULL,
    CONSTRAINT PK_services PRIMARY KEY (service_id),
    CONSTRAINT UQ_services_service_name UNIQUE (service_name)
);
GO

CREATE TABLE dbo.users (
    user_id       INT IDENTITY(1,1) NOT NULL,
    full_name     NVARCHAR(120) NOT NULL,
    email         NVARCHAR(254) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    role          NVARCHAR(30) NOT NULL,
    facility_id   INT NULL,
    is_active     BIT NOT NULL CONSTRAINT DF_users_is_active DEFAULT (1),
    created_at    DATETIME2(0) NOT NULL CONSTRAINT DF_users_created_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_users PRIMARY KEY (user_id),
    CONSTRAINT UQ_users_email UNIQUE (email),
    CONSTRAINT FK_users_facility
        FOREIGN KEY (facility_id) REFERENCES dbo.facilities(facility_id),
    CONSTRAINT CK_users_role
        CHECK (role IN ('FacilityStaff', 'DistrictOfficer', 'StateOfficer', 'Admin')),
    CONSTRAINT CK_users_facility_staff_has_facility
        CHECK (role <> 'FacilityStaff' OR facility_id IS NOT NULL)
);
GO

CREATE TABLE dbo.facility_capacity (
    capacity_id         INT IDENTITY(1,1) NOT NULL,
    facility_id         INT NOT NULL,
    service_id          INT NOT NULL,
    service_available   BIT NOT NULL CONSTRAINT DF_capacity_service_available DEFAULT (0),
    specialist_count    INT NOT NULL CONSTRAINT DF_capacity_specialist_count DEFAULT (0),
    equipment_available BIT NOT NULL CONSTRAINT DF_capacity_equipment_available DEFAULT (0),
    beds_available      INT NOT NULL CONSTRAINT DF_capacity_beds_available DEFAULT (0),
    last_updated        DATETIME2(0) NOT NULL CONSTRAINT DF_capacity_last_updated DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_facility_capacity PRIMARY KEY (capacity_id),
    CONSTRAINT FK_capacity_facility
        FOREIGN KEY (facility_id) REFERENCES dbo.facilities(facility_id),
    CONSTRAINT FK_capacity_service
        FOREIGN KEY (service_id) REFERENCES dbo.services(service_id),
    CONSTRAINT UQ_capacity_facility_service UNIQUE (facility_id, service_id),
    CONSTRAINT CK_capacity_specialist_count CHECK (specialist_count >= 0),
    CONSTRAINT CK_capacity_beds_available CHECK (beds_available >= 0)
);
GO

CREATE TABLE dbo.referrals (
    referral_id           INT IDENTITY(1,1) NOT NULL,
    source_facility_id    INT NOT NULL,
    destination_facility_id INT NOT NULL,
    service_id            INT NOT NULL,
    created_by            INT NOT NULL,
    referral_date         DATE NOT NULL,
    reason                NVARCHAR(250) NOT NULL,
    status                NVARCHAR(30) NOT NULL CONSTRAINT DF_referrals_status DEFAULT ('Referred'),
    CONSTRAINT PK_referrals PRIMARY KEY (referral_id),
    CONSTRAINT FK_referrals_source_facility
        FOREIGN KEY (source_facility_id) REFERENCES dbo.facilities(facility_id),
    CONSTRAINT FK_referrals_destination_facility
        FOREIGN KEY (destination_facility_id) REFERENCES dbo.facilities(facility_id),
    CONSTRAINT FK_referrals_service
        FOREIGN KEY (service_id) REFERENCES dbo.services(service_id),
    CONSTRAINT FK_referrals_created_by
        FOREIGN KEY (created_by) REFERENCES dbo.users(user_id),
    CONSTRAINT CK_referrals_different_facilities
        CHECK (source_facility_id <> destination_facility_id),
    CONSTRAINT CK_referrals_status
        CHECK (status IN ('Referred', 'Accepted', 'Completed', 'Cancelled'))
);
GO

CREATE TABLE dbo.activity_logs (
    log_id     INT IDENTITY(1,1) NOT NULL,
    user_id    INT NOT NULL,
    action     NVARCHAR(250) NOT NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_activity_logs_created_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_activity_logs PRIMARY KEY (log_id),
    CONSTRAINT FK_activity_logs_user
        FOREIGN KEY (user_id) REFERENCES dbo.users(user_id)
);
GO

/* Indexes supporting common filters, joins, and dashboard searches.
   UNIQUE constraints above also create indexes for district names, facility names,
   service names, user emails, and the facility/service capacity pair. */
CREATE INDEX IX_referrals_referral_date
    ON dbo.referrals (referral_date);
GO

CREATE INDEX IX_referrals_source_service_date
    ON dbo.referrals (source_facility_id, service_id, referral_date);
GO

CREATE INDEX IX_referrals_destination_date
    ON dbo.referrals (destination_facility_id, referral_date);
GO

CREATE INDEX IX_referrals_status_date
    ON dbo.referrals (status, referral_date);
GO

CREATE INDEX IX_referrals_created_by
    ON dbo.referrals (created_by);
GO

CREATE INDEX IX_facility_capacity_service_id
    ON dbo.facility_capacity (service_id);
GO

CREATE INDEX IX_activity_logs_user_created_at
    ON dbo.activity_logs (user_id, created_at DESC);
GO
