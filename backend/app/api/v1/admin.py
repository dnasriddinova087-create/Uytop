from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.user import User, UserRole
from app.models.property import Property, PropertyStatus
from app.models.report import Report
from app.models.audit import AuditLog
from app.schemas.user import UserResponse
from app.schemas.property import PropertyResponse
from app.schemas.admin import (
    AdminDashboardStats,
    AdminUserUpdate,
    AdminPropertyModerate,
    AuditLogResponse,
    AuditLogListResponse
)
from app.schemas.report import ReportResponse, ReportUpdate
from app.api.deps import require_admin
from app.api.v1.properties import _format_property_response
from app.services.audit import log_audit

router = APIRouter(prefix="/admin", tags=["Admin Management"])

@router.get("/dashboard", response_model=AdminDashboardStats)
def get_dashboard_stats(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    active_clients = db.query(User).filter(User.role == UserRole.MIJOZ.value, User.is_active == True).count()
    active_brokers = db.query(User).filter(User.role == UserRole.MAKLER.value, User.is_active == True).count()
    blocked_users = db.query(User).filter(User.is_active == False).count()
    
    total_properties = db.query(Property).count()
    active_properties = db.query(Property).filter(Property.status == PropertyStatus.ACTIVE.value).count()
    rented_properties = db.query(Property).filter(Property.status == PropertyStatus.RENTED.value).count()
    pending_properties = db.query(Property).filter(Property.status == PropertyStatus.PENDING.value).count()
    
    total_reports = db.query(Report).count()
    pending_reports = db.query(Report).filter(Report.status == "pending").count()

    return AdminDashboardStats(
        total_users=total_users,
        active_clients=active_clients,
        active_brokers=active_brokers,
        total_properties=total_properties,
        active_properties=active_properties,
        rented_properties=rented_properties,
        pending_properties=pending_properties,
        blocked_users=blocked_users,
        total_reports=total_reports,
        pending_reports=pending_reports
    )

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    search: Optional[str] = None,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    is_verified: Optional[bool] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            (User.first_name.ilike(search_pattern)) |
            (User.last_name.ilike(search_pattern)) |
            (User.phone.ilike(search_pattern)) |
            (User.email.ilike(search_pattern))
        )
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    if is_verified is not None:
        query = query.filter(User.is_verified == is_verified)

    users = query.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return [UserResponse.model_validate(u) for u in users]

@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user_status(
    user_id: int,
    data: AdminUserUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")

    # Protection: Cannot modify another admin if target is superadmin unless authorized
    if target_user.id == admin.id and data.is_active is False:
        raise HTTPException(status_code=400, detail="O'zingizni bloklay olmaysiz")

    changes = {}
    if data.is_active is not None:
        target_user.is_active = data.is_active
        changes["is_active"] = data.is_active
    if data.is_verified is not None:
        target_user.is_verified = data.is_verified
        changes["is_verified"] = data.is_verified
    if data.role is not None:
        if data.role not in [UserRole.ADMIN.value, UserRole.MAKLER.value, UserRole.MIJOZ.value]:
            raise HTTPException(status_code=400, detail="Noto'g'ri rol")
        target_user.role = data.role
        changes["role"] = data.role

    db.commit()
    db.refresh(target_user)

    log_audit(
        db,
        action="ADMIN_UPDATE_USER",
        entity_type="user",
        user_id=admin.id,
        entity_id=target_user.id,
        details=changes
    )

    return UserResponse.model_validate(target_user)

@router.get("/properties", response_model=List[PropertyResponse])
def get_admin_properties(
    status: Optional[str] = None,
    region: Optional[str] = None,
    owner_id: Optional[int] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Property).options(
        joinedload(Property.owner),
        joinedload(Property.images),
        joinedload(Property.amenity),
        joinedload(Property.favorites)
    )

    if status:
        query = query.filter(Property.status == status)
    if region:
        query = query.filter(Property.region.ilike(f"%{region}%"))
    if owner_id:
        query = query.filter(Property.owner_id == owner_id)

    props = query.order_by(Property.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return [_format_property_response(p, admin.id) for p in props]

@router.patch("/properties/{property_id}", response_model=PropertyResponse)
def moderate_property(
    property_id: int,
    data: AdminPropertyModerate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Uy e'loni topilmadi")

    prop.status = data.status
    if data.rejection_reason is not None:
        prop.rejection_reason = data.rejection_reason

    db.commit()
    db.refresh(prop)

    log_audit(
        db,
        action="ADMIN_MODERATE_PROPERTY",
        entity_type="property",
        user_id=admin.id,
        entity_id=prop.id,
        details={"status": prop.status, "rejection_reason": prop.rejection_reason}
    )

    return _format_property_response(prop, admin.id)

@router.get("/reports", response_model=List[ReportResponse])
def get_all_reports(
    status: Optional[str] = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Report).options(joinedload(Report.reporter))
    if status:
        query = query.filter(Report.status == status)
    reports = query.order_by(Report.created_at.desc()).all()

    return [
        ReportResponse(
            id=r.id,
            reporter_id=r.reporter_id,
            reporter=UserResponse.model_validate(r.reporter) if r.reporter else None,
            property_id=r.property_id,
            reason=r.reason,
            details=r.details,
            status=r.status,
            admin_notes=r.admin_notes,
            created_at=r.created_at
        )
        for r in reports
    ]

@router.patch("/reports/{report_id}", response_model=ReportResponse)
def update_report_status(
    report_id: int,
    data: ReportUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    rep = db.query(Report).filter(Report.id == report_id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Shikoyat topilmadi")

    rep.status = data.status
    if data.admin_notes is not None:
        rep.admin_notes = data.admin_notes

    db.commit()
    db.refresh(rep)

    log_audit(
        db,
        action="ADMIN_REVIEW_REPORT",
        entity_type="report",
        user_id=admin.id,
        entity_id=rep.id,
        details={"status": rep.status, "notes": rep.admin_notes}
    )

    return ReportResponse(
        id=rep.id,
        reporter_id=rep.reporter_id,
        reporter=UserResponse.model_validate(rep.reporter) if rep.reporter else None,
        property_id=rep.property_id,
        reason=rep.reason,
        details=rep.details,
        status=rep.status,
        admin_notes=rep.admin_notes,
        created_at=rep.created_at
    )

@router.get("/audit-logs", response_model=AuditLogListResponse)
def get_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    action: Optional[str] = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog).options(joinedload(AuditLog.user))
    if action:
        query = query.filter(AuditLog.action == action)

    total = query.count()
    items = query.order_by(AuditLog.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    resp_items = []
    for log in items:
        resp_items.append(
            AuditLogResponse(
                id=log.id,
                user_id=log.user_id,
                user=UserResponse.model_validate(log.user) if log.user else None,
                action=log.action,
                entity_type=log.entity_type,
                entity_id=log.entity_id,
                details=log.details,
                ip_address=log.ip_address,
                created_at=log.created_at
            )
        )

    return AuditLogListResponse(items=resp_items, total=total)
