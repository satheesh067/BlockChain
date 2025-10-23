import asyncio
import json
import logging
from typing import Dict, List, Set
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Store active connections by user address
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Store connections by role for broadcasting
        self.connections_by_role: Dict[str, Set[WebSocket]] = {
            'farmer': set(),
            'distributor': set(),
            'retailer': set(),
            'customer': set(),
            'admin': set()
        }

    async def connect(self, websocket: WebSocket, user_address: str, user_role: str = None):
        await websocket.accept()
        
        if user_address not in self.active_connections:
            self.active_connections[user_address] = []
        
        self.active_connections[user_address].append(websocket)
        
        if user_role:
            self.connections_by_role[user_role].add(websocket)
        
        logger.info(f"User {user_address} connected with role {user_role}")
        
        # Send welcome message
        await self.send_personal_message({
            "type": "connection_established",
            "payload": {
                "message": "Connected to real-time updates",
                "timestamp": datetime.utcnow().isoformat(),
                "user_address": user_address,
                "user_role": user_role
            }
        }, websocket)

    def disconnect(self, websocket: WebSocket, user_address: str, user_role: str = None):
        if user_address in self.active_connections:
            if websocket in self.active_connections[user_address]:
                self.active_connections[user_address].remove(websocket)
            
            if not self.active_connections[user_address]:
                del self.active_connections[user_address]
        
        if user_role:
            self.connections_by_role[user_role].discard(websocket)
        
        logger.info(f"User {user_address} disconnected")

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")

    async def send_to_user(self, message: dict, user_address: str):
        if user_address in self.active_connections:
            for connection in self.active_connections[user_address]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Error sending message to user {user_address}: {e}")

    async def broadcast_to_role(self, message: dict, role: str):
        if role in self.connections_by_role:
            for connection in self.connections_by_role[role].copy():
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Error broadcasting to role {role}: {e}")
                    # Remove failed connection
                    self.connections_by_role[role].discard(connection)

    async def broadcast_to_all(self, message: dict):
        for user_address, connections in self.active_connections.items():
            for connection in connections.copy():
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Error broadcasting to all: {e}")
                    # Remove failed connection
                    if connection in connections:
                        connections.remove(connection)

    def get_connection_count(self) -> int:
        total = 0
        for connections in self.active_connections.values():
            total += len(connections)
        return total

    def get_connections_by_role(self) -> Dict[str, int]:
        return {role: len(connections) for role, connections in self.connections_by_role.items()}

# Global connection manager instance
manager = ConnectionManager()

class NotificationService:
    def __init__(self):
        self.manager = manager

    async def notify_crop_registered(self, crop_data: dict):
        """Notify all users about a new crop registration"""
        message = {
            "type": "crop_registered",
            "payload": {
                "cropId": crop_data.get("id"),
                "cropName": crop_data.get("name"),
                "farmerAddress": crop_data.get("farmer"),
                "batchNumber": crop_data.get("batchNumber"),
                "quantity": crop_data.get("quantity"),
                "price": crop_data.get("price"),
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
        # Broadcast to all users
        await self.manager.broadcast_to_all(message)
        
        # Send specific notification to farmers
        await self.manager.broadcast_to_role({
            "type": "system_notification",
            "payload": {
                "message": f"New crop '{crop_data.get('name')}' registered in the system",
                "level": "info"
            }
        }, "farmer")

    async def notify_crop_transferred(self, transfer_data: dict):
        """Notify relevant users about crop transfer"""
        message = {
            "type": "crop_transferred",
            "payload": {
                "cropId": transfer_data.get("cropId"),
                "cropName": transfer_data.get("cropName"),
                "fromAddress": transfer_data.get("fromAddress"),
                "toAddress": transfer_data.get("toAddress"),
                "note": transfer_data.get("note"),
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
        # Send to both sender and receiver
        await self.manager.send_to_user(message, transfer_data.get("fromAddress"))
        await self.manager.send_to_user(message, transfer_data.get("toAddress"))
        
        # Broadcast to distributors and retailers
        await self.manager.broadcast_to_role({
            "type": "system_notification",
            "payload": {
                "message": f"Crop '{transfer_data.get('cropName')}' transferred in supply chain",
                "level": "info"
            }
        }, "distributor")
        
        await self.manager.broadcast_to_role({
            "type": "system_notification",
            "payload": {
                "message": f"Crop '{transfer_data.get('cropName')}' transferred in supply chain",
                "level": "info"
            }
        }, "retailer")

    async def notify_crop_purchased(self, purchase_data: dict):
        """Notify about crop purchase"""
        message = {
            "type": "crop_purchased",
            "payload": {
                "cropId": purchase_data.get("cropId"),
                "cropName": purchase_data.get("cropName"),
                "buyerAddress": purchase_data.get("buyerAddress"),
                "amount": purchase_data.get("amount"),
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
        # Send to buyer
        await self.manager.send_to_user(message, purchase_data.get("buyerAddress"))
        
        # Notify farmers about successful sale
        await self.manager.broadcast_to_role({
            "type": "system_notification",
            "payload": {
                "message": f"Crop '{purchase_data.get('cropName')}' sold successfully!",
                "level": "success"
            }
        }, "farmer")

    async def notify_role_granted(self, role_data: dict):
        """Notify about role changes"""
        message = {
            "type": "role_granted",
            "payload": {
                "role": role_data.get("role"),
                "userAddress": role_data.get("userAddress"),
                "grantedBy": role_data.get("grantedBy"),
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
        # Send to the user who got the role
        await self.manager.send_to_user(message, role_data.get("userAddress"))
        
        # Notify admins
        await self.manager.broadcast_to_role({
            "type": "system_notification",
            "payload": {
                "message": f"Role '{role_data.get('role')}' granted to user",
                "level": "info"
            }
        }, "admin")

    async def notify_system_event(self, event_data: dict):
        """Send system-wide notifications"""
        message = {
            "type": "system_notification",
            "payload": {
                "message": event_data.get("message"),
                "level": event_data.get("level", "info"),
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
        if event_data.get("target_role"):
            await self.manager.broadcast_to_role(message, event_data.get("target_role"))
        else:
            await self.manager.broadcast_to_all(message)

    async def notify_price_update(self, price_data: dict):
        """Notify about price changes"""
        message = {
            "type": "price_update",
            "payload": {
                "cropId": price_data.get("cropId"),
                "cropName": price_data.get("cropName"),
                "oldPrice": price_data.get("oldPrice"),
                "newPrice": price_data.get("newPrice"),
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
        # Notify all users about price changes
        await self.manager.broadcast_to_all(message)

    async def notify_quality_check(self, quality_data: dict):
        """Notify about quality check results"""
        message = {
            "type": "quality_check",
            "payload": {
                "cropId": quality_data.get("cropId"),
                "cropName": quality_data.get("cropName"),
                "qualityScore": quality_data.get("qualityScore"),
                "inspector": quality_data.get("inspector"),
                "notes": quality_data.get("notes"),
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
        # Notify relevant parties
        await self.manager.send_to_user(message, quality_data.get("farmerAddress"))
        await self.manager.broadcast_to_role(message, "distributor")
        await self.manager.broadcast_to_role(message, "retailer")

# Global notification service instance
notification_service = NotificationService()

# WebSocket endpoint handler
async def websocket_endpoint(websocket: WebSocket, user_address: str = None, user_role: str = None):
    await manager.connect(websocket, user_address, user_role)
    
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types from client
            if message.get("type") == "ping":
                await manager.send_personal_message({
                    "type": "pong",
                    "payload": {"timestamp": datetime.utcnow().isoformat()}
                }, websocket)
            
            elif message.get("type") == "subscribe_to_crop":
                # Handle crop-specific subscriptions
                crop_id = message.get("payload", {}).get("cropId")
                if crop_id:
                    # Store subscription info (simplified implementation)
                    logger.info(f"User {user_address} subscribed to crop {crop_id}")
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_address, user_role)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, user_address, user_role)
