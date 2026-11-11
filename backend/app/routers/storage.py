import os
import json
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response
from fastapi.responses import FileResponse
from pydantic import BaseModel
from backend.app.config import settings
from backend.app import models, auth

router = APIRouter(prefix="/storage", tags=["Azure Blob Storage & Data Classification"])

STORAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage_data")
os.makedirs(STORAGE_DIR, exist_ok=True)

class StorageFileItem(BaseModel):
    filename: str
    category: str # "Semi-Structured (JSON)" or "Unstructured (PDF/Document)"
    size_bytes: int
    last_modified: datetime
    content_type: str
    description: str

# Seed initial demonstration semi-structured and unstructured files
def init_demo_files():
    # 1. Semi-Structured JSON: District Health Profile & Referral Metadata
    json_path = os.path.join(STORAGE_DIR, "district_health_profile_central_delhi.json")
    if not os.path.exists(json_path):
        sample_json = {
            "metadata_version": "2.4.0",
            "jurisdiction": "Central Delhi Health Authority",
            "survey_year": 2026,
            "demographic_profile": {
                "catchment_population": 582000,
                "vulnerability_index": 0.38,
                "primary_care_coverage_ratio": 0.82
            },
            "specialist_gap_assessment": [
                {
                    "specialty": "Cardiology",
                    "sanctioned_cadre": 12,
                    "in_position": 4,
                    "deficit_percentage": 66.7,
                    "recommended_referral_cluster": "Tertiary Care Hospital New Delhi"
                },
                {
                    "specialty": "Radiology (CT/MRI)",
                    "sanctioned_cadre": 8,
                    "in_position": 2,
                    "deficit_percentage": 75.0,
                    "recommended_referral_cluster": "District Hospital Central"
                }
            ],
            "facility_telemetry_nodes": 14,
            "data_classification": "Semi-Structured JSON Object"
        }
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(sample_json, f, indent=2)

    # 2. Unstructured Demonstration Report: Facility Referral Audit Report (Text/PDF Simulation)
    doc_path = os.path.join(STORAGE_DIR, "facility_gap_audit_report_q3_2026.txt")
    if not os.path.exists(doc_path):
        sample_doc = (
            "========================================================================\n"
            "SEHAT-SETU HEALTHCARE SYSTEM AUDIT REPORT - Q3 2026\n"
            "Document Type: Unstructured Evaluation Report\n"
            "Classification: Administrative Decision-Support Audit\n"
            "========================================================================\n\n"
            "1. EXECUTIVE MEMORANDUM\n"
            "This document constitutes an unstructured facility audit reviewing outbound referral\n"
            "trajectories across primary and secondary centres within Delhi NCR.\n\n"
            "2. SUMMARY OF CLINICAL REFERRAL PATTERNS\n"
            "Over the 180-day audit cycle, Community Health Centres exhibited a recurrent tendency\n"
            "to escalate cases demanding specialized intervention (specifically cardiology and\n"
            "advanced diagnostic imaging). Correlating these volumes with self-reported facility\n"
            "capacity confirms that 84% of these referrals align with certified resource deficits\n"
            "(equipment under maintenance or specialist vacancies), validating the decision-support\n"
            "rules implemented in the SEHAT-SETU analytics engine.\n\n"
            "3. POLICY ACTIONABLE RECOMMENDATIONS\n"
            "A. Fast-track mobile diagnostic imaging units to CHC Paharganj.\n"
            "B. Re-allocate visiting cardiologists from Tertiary Medical College on bi-weekly rotations.\n\n"
            "End of Unstructured Audit Record.\n"
        )
        with open(doc_path, "w", encoding="utf-8") as f:
            f.write(sample_doc)

init_demo_files()

@router.get("/files", response_model=List[StorageFileItem])
def list_storage_files(current_user: models.User = Depends(auth.get_current_user)):
    files = []
    for fname in os.listdir(STORAGE_DIR):
        fpath = os.path.join(STORAGE_DIR, fname)
        if os.path.isfile(fpath):
            stat = os.stat(fpath)
            ext = os.path.splitext(fname)[1].lower()
            if ext == ".json":
                cat = "Semi-Structured (JSON Metadata)"
                ctype = "application/json"
                desc = "District health profile and telemetry configuration metadata"
            elif ext in [".pdf", ".txt", ".docx"]:
                cat = "Unstructured (Document / Audit Report)"
                ctype = "application/pdf" if ext == ".pdf" else "text/plain"
                desc = "Quarterly facility audit report and gap assessment documentation"
            else:
                cat = "Demonstration Artifact"
                ctype = "application/octet-stream"
                desc = "Healthcare administrative asset"

            files.append(StorageFileItem(
                filename=fname,
                category=cat,
                size_bytes=stat.st_size,
                last_modified=datetime.fromtimestamp(stat.st_mtime),
                content_type=ctype,
                description=desc
            ))
    return files

@router.get("/download/{filename}")
def download_file(filename: str, current_user: models.User = Depends(auth.get_current_user)):
    fpath = os.path.join(STORAGE_DIR, filename)
    if not os.path.exists(fpath) or not os.path.isfile(fpath):
        raise HTTPException(status_code=404, detail="Requested file not found in storage")
    return FileResponse(fpath, filename=filename)

@router.post("/upload")
def upload_file(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.require_roles(["Administrator", "State Officer"]))
):
    fpath = os.path.join(STORAGE_DIR, file.filename)
    with open(fpath, "wb") as f:
        f.write(file.file.read())
    return {"message": f"Successfully uploaded '{file.filename}' to storage container", "size": os.path.getsize(fpath)}
