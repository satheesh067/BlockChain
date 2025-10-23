from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import List, Optional
import os
import json
from datetime import datetime

from .models import (
    CropRegistrationRequest, CropResponse, CropTransferRequest,
    CropHistoryResponse, FileUploadResponse, TransactionResponse,
    UserProfile, UserRole, CropStatus, TransferEvent, UserRegisterRequest
)
from ..blockchain import get_contract, get_web3, wait_for_transaction_receipt
from ..ipfs_service import ipfs_service
from ..websocket_service import notification_service
from .. import config

router = APIRouter()

# ---------------- In-memory User Profiles ----------------

user_profiles = {}

def load_data():
    global user_profiles
    try:
        if os.path.exists('user_profiles.json'):
            with open('user_profiles.json', 'r') as f:
                data = json.load(f)
                for address, profile_data in data.items():
                    user_profiles[address] = UserProfile(**profile_data)
    except Exception as e:
        print(f"Error loading user data: {e}")

def default_serializer(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError("Type not serializable")

def save_data():
    try:
        data = {address: profile.dict() for address, profile in user_profiles.items()}
        with open('user_profiles.json', 'w') as f:
            json.dump(data, f, indent=2, default=default_serializer)
    except Exception as e:
        print(f"Error saving user data: {e}")

load_data()

# ---------------- User Endpoints ----------------

@router.post("/users/register", response_model=UserProfile)
async def register_user(user_data: UserRegisterRequest):
    try:
        user_profile = UserProfile(
            address=user_data.address,
            name=user_data.name,
            email=user_data.email,
            role=user_data.role,
            registered_at=datetime.utcnow()
        )
        user_profiles[user_profile.address.lower()] = user_profile
        save_data()
        return user_profile
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/users/{address}", response_model=UserProfile)
async def get_user_profile(address: str):
    address = address.lower()
    if address not in user_profiles:
        raise HTTPException(status_code=404, detail="User not found")
    return user_profiles[address]

# ---------------- File Upload ----------------

@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(file: UploadFile = File(...)):
    try:
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in config.ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="File type not allowed")
        content = await file.read()
        ipfs_hash = ipfs_service.upload_bytes(content, file.filename)
        if not ipfs_hash:
            raise HTTPException(status_code=500, detail="Failed to upload to IPFS")
        ipfs_service.pin_file(ipfs_hash)
        file_url = ipfs_service.get_file_url(ipfs_hash)
        return FileUploadResponse(success=True, ipfs_hash=ipfs_hash, file_url=file_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------------- Crop Endpoints ----------------

@router.post("/crops", response_model=TransactionResponse)
async def register_crop(
    name: str = Form(...),
    quantity: int = Form(...),
    price: int = Form(...),
    batch_number: str = Form(...),
    harvest_date: str = Form(...),
    expiry_date: str = Form(...),
    farm_coords: str = Form(...),
    ipfs_image_hash: Optional[str] = Form(None),
    ipfs_cert_hash: Optional[str] = Form(None),
    farmer_address: str = Form(...)
):
    try:
        if farmer_address.lower() not in user_profiles:
            raise HTTPException(status_code=400, detail="User not registered")
        user_profile = user_profiles[farmer_address.lower()]
        if user_profile.role != UserRole.FARMER:
            raise HTTPException(status_code=403, detail="Only farmers can register crops")

        crop_data = CropRegistrationRequest(
            name=name,
            quantity=quantity,
            price=price,
            batch_number=batch_number,
            harvest_date=harvest_date,
            expiry_date=expiry_date,
            farm_coords=farm_coords,
            ipfs_image_hash=ipfs_image_hash,
            ipfs_cert_hash=ipfs_cert_hash
        )

        contract = get_contract()
        tx = contract.functions.registerCrop(
            crop_data.name,
            crop_data.quantity,
            crop_data.price,
            crop_data.batch_number,
            crop_data.harvest_date,
            crop_data.expiry_date,
            crop_data.ipfs_image_hash or "",
            crop_data.ipfs_cert_hash or "",
            crop_data.farm_coords
        ).transact({"from": farmer_address})

        receipt = wait_for_transaction_receipt(tx)
        if receipt.status != 1:
            raise HTTPException(status_code=500, detail="Blockchain transaction failed")

        await notification_service.notify_crop_registered({
            "name": crop_data.name,
            "farmer": farmer_address,
            "batchNumber": crop_data.batch_number,
            "quantity": crop_data.quantity,
            "price": crop_data.price
        })

        return TransactionResponse(
            success=True,
            transaction_hash=tx.hex(),
            gas_used=receipt.gasUsed,
            block_number=receipt.blockNumber
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/crops", response_model=List[CropResponse])
async def get_all_crops():
    try:
        contract = get_contract()
        all_crops = contract.functions.getAllCrops().call()
        crops = [
            CropResponse(
                id=c[0], name=c[1], quantity=c[2], price=c[3],
                batch_number=c[4], harvest_date=c[5], expiry_date=c[6],
                ipfs_image_hash=c[7] or None, ipfs_cert_hash=c[8] or None,
                farm_coords=c[9], current_owner=c[10],
                available=c[11], created_at=c[12],
                status=CropStatus.AVAILABLE if c[11] else CropStatus.SOLD,
                image_url=ipfs_service.get_file_url(c[7]) if c[7] else None,
                cert_url=ipfs_service.get_file_url(c[8]) if c[8] else None
            ) for c in all_crops
        ]
        return crops
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in get_all_crops: {str(e)}")

@router.get("/crops/my/{address}", response_model=List[CropResponse])
async def get_my_crops(address: str):
    """Get all crops owned by a specific address."""
    try:
        contract = get_contract()
        my_crops = contract.functions.getCropsByOwner(address).call()
        crops = [
            CropResponse(
                id=c[0], name=c[1], quantity=c[2], price=c[3],
                batch_number=c[4], harvest_date=c[5], expiry_date=c[6],
                ipfs_image_hash=c[7] or None, ipfs_cert_hash=c[8] or None,
                farm_coords=c[9], current_owner=c[10],
                available=c[11], created_at=c[12],
                status=CropStatus.AVAILABLE if c[11] else CropStatus.SOLD,
                image_url=ipfs_service.get_file_url(c[7]) if c[7] else None,
                cert_url=ipfs_service.get_file_url(c[8]) if c[8] else None
            ) for c in my_crops
        ]
        return crops
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in get_my_crops: {str(e)}")

@router.get("/crops/available", response_model=List[CropResponse])
async def get_available_crops():
    try:
        contract = get_contract()
        available = contract.functions.getAvailableCrops().call()
        crops = [
            CropResponse(
                id=c[0], name=c[1], quantity=c[2], price=c[3],
                batch_number=c[4], harvest_date=c[5], expiry_date=c[6],
                ipfs_image_hash=c[7] or None, ipfs_cert_hash=c[8] or None,
                farm_coords=c[9], current_owner=c[10],
                available=c[11], created_at=c[12],
                status=CropStatus.AVAILABLE,
                image_url=ipfs_service.get_file_url(c[7]) if c[7] else None,
                cert_url=ipfs_service.get_file_url(c[8]) if c[8] else None
            ) for c in available
        ]
        return crops
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in get_available_crops: {str(e)}")
