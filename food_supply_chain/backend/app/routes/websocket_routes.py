from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from typing import Optional
import logging
from ..websocket_service import websocket_endpoint, notification_service
from ..blockchain import get_contract

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/ws")
async def websocket_connection(
    websocket: WebSocket,
    user_address: Optional[str] = Query(None),
    user_role: Optional[str] = Query(None)
):
    """
    WebSocket endpoint for real-time notifications
    Query parameters:
    - user_address: Ethereum address of the user
    - user_role: Role of the user (farmer, distributor, retailer, customer, admin)
    """
    await websocket_endpoint(websocket, user_address, user_role)

@router.post("/notifications/crop-registered")
async def notify_crop_registered(crop_data: dict):
    """Trigger notification for crop registration"""
    try:
        await notification_service.notify_crop_registered(crop_data)
        return {"success": True, "message": "Notification sent"}
    except Exception as e:
        logger.error(f"Failed to send crop registration notification: {e}")
        return {"success": False, "error": str(e)}

@router.post("/notifications/crop-transferred")
async def notify_crop_transferred(transfer_data: dict):
    """Trigger notification for crop transfer"""
    try:
        await notification_service.notify_crop_transferred(transfer_data)
        return {"success": True, "message": "Notification sent"}
    except Exception as e:
        logger.error(f"Failed to send crop transfer notification: {e}")
        return {"success": False, "error": str(e)}

@router.post("/notifications/crop-purchased")
async def notify_crop_purchased(purchase_data: dict):
    """Trigger notification for crop purchase"""
    try:
        await notification_service.notify_crop_purchased(purchase_data)
        return {"success": True, "message": "Notification sent"}
    except Exception as e:
        logger.error(f"Failed to send crop purchase notification: {e}")
        return {"success": False, "error": str(e)}

@router.post("/notifications/role-granted")
async def notify_role_granted(role_data: dict):
    """Trigger notification for role changes"""
    try:
        await notification_service.notify_role_granted(role_data)
        return {"success": True, "message": "Notification sent"}
    except Exception as e:
        logger.error(f"Failed to send role granted notification: {e}")
        return {"success": False, "error": str(e)}

@router.post("/notifications/system-event")
async def notify_system_event(event_data: dict):
    """Trigger system-wide notification"""
    try:
        await notification_service.notify_system_event(event_data)
        return {"success": True, "message": "Notification sent"}
    except Exception as e:
        logger.error(f"Failed to send system notification: {e}")
        return {"success": False, "error": str(e)}

@router.get("/notifications/stats")
async def get_notification_stats():
    """Get WebSocket connection statistics"""
    from .websocket_service import manager
    
    return {
        "total_connections": manager.get_connection_count(),
        "connections_by_role": manager.get_connections_by_role(),
        "active_users": list(manager.active_connections.keys())
    }

@router.post("/notifications/test")
async def test_notification(message: str = "Test notification"):
    """Send a test notification to all connected users"""
    try:
        await notification_service.notify_system_event({
            "message": message,
            "level": "info"
        })
        return {"success": True, "message": "Test notification sent"}
    except Exception as e:
        logger.error(f"Failed to send test notification: {e}")
        return {"success": False, "error": str(e)}
