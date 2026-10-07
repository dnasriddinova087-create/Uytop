from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.property import Property
from app.models.report import Report
from app.schemas.report import ReportCreate, ReportResponse
from app.schemas.user import UserResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    report_in: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prop = db.query(Property).filter(Property.id == report_in.property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Uy e'loni topilmadi")

    rep = Report(
        reporter_id=current_user.id,
        property_id=report_in.property_id,
        reason=report_in.reason.strip(),
        details=report_in.details.strip() if report_in.details else None,
        status="pending"
    )
    db.add(rep)
    db.commit()
    db.refresh(rep)

    return ReportResponse(
        id=rep.id,
        reporter_id=rep.reporter_id,
        reporter=UserResponse.model_validate(current_user),
        property_id=rep.property_id,
        reason=rep.reason,
        details=rep.details,
        status=rep.status,
        admin_notes=rep.admin_notes,
        created_at=rep.created_at
    )

@router.get("/my", response_model=List[ReportResponse])
def get_my_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reps = db.query(Report).filter(Report.reporter_id == current_user.id).order_by(Report.created_at.desc()).all()
    return [
        ReportResponse(
            id=r.id,
            reporter_id=r.reporter_id,
            reporter=UserResponse.model_validate(current_user),
            property_id=r.property_id,
            reason=r.reason,
            details=r.details,
            status=r.status,
            admin_notes=r.admin_notes,
            created_at=r.created_at
        )
        for r in reps
    ]
