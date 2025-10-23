import requests
from .config import PINATA_API_KEY, PINATA_SECRET

PINATA_PIN_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS"

def pin_file_to_pinata(file_bytes, filename):
    if not PINATA_API_KEY or not PINATA_SECRET:
        # Dev fallback: return dummy hash so local dev continues
        return "QmDevDummyHash"  # not real IPFS — replace for prod

    files = {
        'file': (filename, file_bytes)
    }
    headers = {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET
    }

    try:
        response = requests.post(PINATA_PIN_FILE_URL, files=files, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data.get("IpfsHash")
    except requests.exceptions.RequestException as e:
        print(f"Pinata upload failed: {e}")
        return None
