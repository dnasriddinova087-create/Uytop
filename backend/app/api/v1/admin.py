from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.user import User, UserRole
from app.models.property import Property, PropertyStatus
from app.models.report import Report
from app.models.audit import AuditLog
from app.models.chat import Conversation, Message
from app.schemas.user import UserResponse
from app.schemas.property import PropertyResponse
from app.schemas.chat import ConversationResponse, MessageResponse
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
from app.api.v1.conversations import _format_conversation
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
    sort_by: Optional[str] = Query("newest", pattern="^(newest|oldest|name_asc|name_desc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=500),
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

    if sort_by == "oldest":
        query = query.order_by(User.created_at.asc())
    elif sort_by == "name_asc":
        query = query.order_by(User.first_name.asc(), User.last_name.asc())
    elif sort_by == "name_desc":
        query = query.order_by(User.first_name.desc(), User.last_name.desc())
    else:
        query = query.order_by(User.created_at.desc())

    users = query.offset((page - 1) * page_size).limit(page_size).all()
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

@router.delete("/users/{user_id}")
def admin_delete_user(
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Permanently delete a registered user (client or broker) by Admin. Persists until admin deletes."""
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")

    if target_user.id == admin.id:
        raise HTTPException(status_code=400, detail="Administrator o'z akkauntini o'chira olmaydi")

    user_info = f"{target_user.first_name} {target_user.last_name} ({target_user.phone})"

    # Disassociate/delete chat messages and conversations to avoid foreign key issues
    db.query(Message).filter(Message.sender_id == target_user.id).delete(synchronize_session=False)
    db.query(Conversation).filter(
        (Conversation.client_id == target_user.id) | (Conversation.broker_id == target_user.id)
    ).delete(synchronize_session=False)

    # Delete reports filed by user
    db.query(Report).filter(Report.reporter_id == target_user.id).delete(synchronize_session=False)

    db.delete(target_user)
    db.commit()

    log_audit(
        db,
        action="ADMIN_DELETE_USER",
        entity_type="user",
        user_id=admin.id,
        entity_id=user_id,
        details={"deleted_user": user_info}
    )

    return {"message": f"Foydalanuvchi ({user_info}) tizimdan muvaffaqiyatli o'chirildi", "id": user_id}

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
    search: Optional[str] = None,
    user_id: Optional[int] = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog).options(joinedload(AuditLog.user))
    if action:
        query = query.filter(AuditLog.action == action)
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.outerjoin(User, AuditLog.user_id == User.id).filter(
            (AuditLog.action.ilike(search_pattern)) |
            (AuditLog.details.ilike(search_pattern)) |
            (AuditLog.ip_address.ilike(search_pattern)) |
            (User.first_name.ilike(search_pattern)) |
            (User.last_name.ilike(search_pattern)) |
            (User.phone.ilike(search_pattern))
        )

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

@router.delete("/audit-logs/{log_id}")
def delete_audit_log(
    log_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin can delete a specific user activity/audit log."""
    log_entry = db.query(AuditLog).filter(AuditLog.id == log_id).first()
    if not log_entry:
        raise HTTPException(status_code=404, detail="Audit yozuvi topilmadi")
    db.delete(log_entry)
    db.commit()
    return {"message": "Audit yozuvi muvaffaqiyatli o'chirildi", "id": log_id}

@router.delete("/audit-logs")
def clear_audit_logs(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin can clear all user activity/audit logs."""
    count = db.query(AuditLog).delete()
    db.commit()
    return {"message": f"Barcha foydalanuvchi harakat jurnallari ({count} ta) o'chirildi", "count": count}

@router.delete("/properties/{property_id}")
def admin_delete_property(
    property_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Uy e'loni topilmadi")
    db.delete(prop)
    db.commit()
    log_audit(db, "ADMIN_DELETE_PROPERTY", "property", admin.id, property_id)
    return {"message": "E'lon admin tomonidan o'chirildi"}

@router.get("/conversations", response_model=List[ConversationResponse])
def get_admin_conversations(
    search: Optional[str] = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Conversation).options(
        joinedload(Conversation.client),
        joinedload(Conversation.broker),
        joinedload(Conversation.property).joinedload(Property.images),
        joinedload(Conversation.property).joinedload(Property.amenity),
        joinedload(Conversation.messages)
    )
    convs = query.order_by(Conversation.updated_at.desc()).all()
    results = [_format_conversation(c, admin.id) for c in convs]
    if search:
        s = search.lower().strip()
        results = [
            r for r in results
            if (r.client and (s in r.client.first_name.lower() or s in r.client.last_name.lower() or s in r.client.phone))
            or (r.broker and (s in r.broker.first_name.lower() or s in r.broker.last_name.lower() or s in r.broker.phone))
            or (r.property and s in r.property.title.lower())
        ]
    return results

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
def get_admin_conversation_messages(
    conversation_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Suhbat topilmadi")
    messages = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at.asc()).all()
    return [MessageResponse.model_validate(m) for m in messages]

