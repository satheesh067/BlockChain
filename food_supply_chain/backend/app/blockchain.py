from pathlib import Path
import json
from web3 import Web3
from . import config

# Connect to your node
w3 = Web3(Web3.HTTPProvider(config.RPC_URL))

# Correct path to ABI JSON - go up to food_supply_chain directory
ARTIFACT_PATH = Path(__file__).parent.parent.parent / "artifacts" / "contracts" / "EnhancedFoodSupplyChain.sol" / "EnhancedFoodSupplyChain.json"

# Load ABI
if ARTIFACT_PATH.exists():
    with open(ARTIFACT_PATH) as f:
        artifact = json.load(f)
    ABI = artifact.get("abi")
else:
    ABI = None

def get_contract():
    if ABI is None:
        raise RuntimeError(
            f"Contract ABI not found at {ARTIFACT_PATH}. Compile contracts with Hardhat first."
        )
    if not Web3.is_address(config.CONTRACT_ADDRESS):
        raise RuntimeError("Set CONTRACT_ADDRESS in backend config or .env")
    contract_instance = w3.eth.contract(
        address=Web3.to_checksum_address(config.CONTRACT_ADDRESS),
        abi=ABI
    )
    # Add w3 to contract instance for easy access
    contract_instance.w3 = w3
    return contract_instance


def get_web3():
    return w3

def get_accounts():
    """Get all available accounts from the local blockchain"""
    return w3.eth.accounts

def get_account_balance(address):
    """Get ETH balance of an account"""
    return w3.eth.get_balance(address)

def wait_for_transaction_receipt(tx_hash, timeout=300):
    """Wait for transaction to be mined"""
    return w3.eth.wait_for_transaction_receipt(tx_hash, timeout=timeout)

def get_transaction_receipt(tx_hash):
    """Get transaction receipt"""
    return w3.eth.get_transaction_receipt(tx_hash)

def get_latest_block():
    """Get latest block number"""
    return w3.eth.block_number


# contract = get_contract()  # Comment out to avoid immediate loading
