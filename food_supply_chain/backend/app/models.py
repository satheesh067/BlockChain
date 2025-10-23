from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    FARMER = "farmer"
    DISTRIBUTOR = "distributor"
    RETAILER = "retailer"
    CUSTOMER = "customer"

class CropStatus(str, Enum):
    AVAILABLE = "available"
    SOLD = "sold"
    TRANSFERRED = "transferred"
    EXPIRED = "expired"

class UserProfile(BaseModel):
    address: str
    role: UserRole
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    organization: Optional[str] = None
    location: Optional[str] = None
    created_at: Optional[datetime] = None
    verified: bool = False

class CropRegistrationRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    quantity: Optional[int] = Field(None, gt=0)
    price: Optional[int] = Field(None, gt=0)
    batch_number: Optional[str] = Field(None, min_length=1, max_length=50)
    harvest_date: Optional[int] = Field(None, description="Unix timestamp")
    expiry_date: Optional[int] = Field(None, description="Unix timestamp")
    farm_coords: Optional[str] = Field(None, description="GPS coordinates as 'lat,lng'")
    ipfs_image_hash: Optional[str] = None
    ipfs_cert_hash: Optional[str] = None

    @validator('expiry_date')
    def expiry_after_harvest(cls, v, values):
        if v is not None and 'harvest_date' in values and values['harvest_date'] is not None:
            if v <= values['harvest_date']:
                raise ValueError('Expiry date must be after harvest date')
        return v

    @validator('farm_coords')
    def validate_coords(cls, v):
        if not v:
            return v
        try:
            parts = v.split(',')
            if len(parts) != 2:
                raise ValueError('Coordinates must be in format "lat,lng"')
            lat, lng = float(parts[0]), float(parts[1])
            if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
                raise ValueError('Invalid latitude or longitude')
        except ValueError as e:
            raise ValueError(f'Invalid coordinates format: {e}')
        return v


class CropTransferRequest(BaseModel):
    crop_id: int = Field(..., gt=0)
    to_address: str
    note: Optional[str] = Field(None, max_length=500)
    ipfs_data_hash: Optional[str] = None

class CropResponse(BaseModel):
    id: int
    name: str
    quantity: int
    price: int
    batch_number: str
    harvest_date: int
    expiry_date: int
    ipfs_image_hash: Optional[str]
    ipfs_cert_hash: Optional[str]
    farm_coords: str
    current_owner: str
    available: bool
    created_at: int
    status: CropStatus
    image_url: Optional[str] = None
    cert_url: Optional[str] = None

class TransferEvent(BaseModel):
    from_address: str
    to_address: str
    timestamp: int
    note: str
    ipfs_data_hash: Optional[str]
    transaction_hash: Optional[str]

class CropHistoryResponse(BaseModel):
    crop_id: int
    crop_info: CropResponse
    history: List[TransferEvent]

class UserRegistrationRequest(BaseModel):
    address: str
    role: UserRole
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    organization: Optional[str] = None
    location: Optional[str] = None

class FileUploadResponse(BaseModel):
    success: bool
    ipfs_hash: Optional[str] = None
    file_url: Optional[str] = None
    error: Optional[str] = None

class TransactionResponse(BaseModel):
    success: bool
    transaction_hash: Optional[str] = None
    error: Optional[str] = None
    gas_used: Optional[int] = None
    block_number: Optional[int] = None

class NotificationData(BaseModel):
    type: str
    crop_id: Optional[int] = None
    transaction_hash: Optional[str] = None
    message: str
    timestamp: int
    status: str

class AnalyticsResponse(BaseModel):
    total_crops: int
    available_crops: int
    sold_crops: int
    total_transactions: int
    total_value: int
    farmers_count: int
    distributors_count: int
    retailers_count: int
    customers_count: int
    recent_activity: List[Dict[str, Any]]