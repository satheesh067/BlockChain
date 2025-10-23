# backend/app/routes/crop_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..blockchain import get_contract

router = APIRouter()

# Example Pydantic model for a crop
class CropRegisterRequest(BaseModel):
    name: str
    quantity: int
    price: int

@router.post("/register")
def register_crop(crop: CropRegisterRequest):
    try:
        contract_instance = get_contract()
        tx = contract_instance.functions.registerCrop(
            crop.name, crop.quantity, crop.price
        ).transact({"from": contract_instance.w3.eth.accounts[0]})  # replace with farmer account
        contract_instance.w3.eth.wait_for_transaction_receipt(tx)
        return {"status": "success", "tx": tx.hex()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
def get_crops():
    try:
        contract_instance = get_contract()
        count = contract_instance.functions.cropCount().call()
        crops = []
        for i in range(1, count + 1):
            c = contract_instance.functions.getCrop(i).call()
            crops.append({
                "id": c[0],
                "name": c[1],
                "quantity": c[2],
                "price": c[3],
                "farmer": c[4],
                "sold": c[5]
            })
        return {"crops": crops}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
