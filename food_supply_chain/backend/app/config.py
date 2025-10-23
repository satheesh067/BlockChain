import os
from dotenv import load_dotenv

# Load env from backend/.env if present
here = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(here, "..", ".env")
load_dotenv(env_path)

# Blockchain Configuration
RPC_URL = os.getenv("RPC_URL", "http://127.0.0.1:8545")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "0x5FbDB2315678afecb367f032d93F642f64180aa3")

# IPFS Configuration
IPFS_URL = os.getenv("IPFS_URL", "http://127.0.0.1:5001")  # Local IPFS node
PINATA_API_KEY = os.getenv("PINATA_API_KEY", "")
PINATA_SECRET = os.getenv("PINATA_SECRET", "")
USE_PINATA = os.getenv("USE_PINATA", "false").lower() == "true"

# File Upload Configuration
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'}

# WebSocket Configuration
WS_PORT = int(os.getenv("WS_PORT", "8001"))
