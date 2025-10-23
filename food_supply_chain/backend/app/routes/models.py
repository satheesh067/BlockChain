from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
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

class UserRegisterRequest(BaseModel):
    address: str = Field(..., min_length=42, max_length=42)
    name: str = Field(..., min_length=2, max_length=50)
    email: str = Field(..., pattern=r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
    role: UserRole

class UserProfile(BaseModel):
    address: str
    name: str
    email: str
    role: UserRole
    registered_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }

class CropRegistrationRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    quantity: int = Field(..., gt=0, le=1000000)
    price: int = Field(..., ge=0)  # Price in wei
    batch_number: str = Field(..., min_length=1, max_length=50)
    harvest_date: int  # Unix timestamp
    expiry_date: int   # Unix timestamp
    ipfs_image_hash: Optional[str] = None
    ipfs_cert_hash: Optional[str] = None
    farm_coords: str = Field(..., min_length=1, max_length=100)

class CropTransferRequest(BaseModel):
    crop_id: int = Field(..., gt=0)
    to_address: str = Field(..., min_length=42, max_length=42)
    note: Optional[str] = Field(None, max_length=500)
    ipfs_data_hash: Optional[str] = None

class CropPurchaseRequest(BaseModel):
    crop_id: int = Field(..., gt=0)

class TransferEvent(BaseModel):
    from_address: str
    to_address: str
    timestamp: int
    note: str
    ipfs_data_hash: Optional[str] = None

class CropResponse(BaseModel):
    id: int
    name: str
    quantity: int
    price: int
    batch_number: str
    harvest_date: int
    expiry_date: int
    ipfs_image_hash: Optional[str] = None
    ipfs_cert_hash: Optional[str] = None
    farm_coords: str
    current_owner: str
    available: bool
    created_at: int
    status: CropStatus
    image_url: Optional[str] = None
    cert_url: Optional[str] = None

class CropHistoryResponse(BaseModel):
    crop_id: int
    history: List[TransferEvent]

class FileUploadResponse(BaseModel):
    success: bool
    ipfs_hash: str
    file_url: str
    error: Optional[str] = None

class TransactionResponse(BaseModel):
    success: bool
    transaction_hash: str
    gas_used: int
    block_number: int
    error: Optional[str] = None

class UserProfileResponse(BaseModel):
    address: str
    name: str
    email: str
    role: UserRole
    registered_at: datetime
    crops_count: int = 0
    transfers_count: int = 0
