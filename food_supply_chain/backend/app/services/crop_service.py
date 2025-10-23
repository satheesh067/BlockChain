from ..blockchain import get_contract, w3
from ..blockchain import w3 as web3_instance
from ..ipfs_utils import pin_file_to_pinata

def register_crop_onchain(name: str, ipfs_hash: str, quantity: int, harvest_days: int, price_wei: int):
    contract = get_contract()
    # Use first account from local node for dev (unlocked)
    accounts = web3_instance.eth.accounts
    if not accounts:
        raise RuntimeError("No accounts available on RPC node.")
    acct = accounts[0]
    txn = contract.functions.registerCrop(name, ipfs_hash, quantity, harvest_days, price_wei).build_transaction({
        "from": acct,
        "nonce": web3_instance.eth.get_transaction_count(acct),
        "gas": 4000000,
        "gasPrice": web3_instance.to_wei('1', 'gwei')
    })
    # On Hardhat local node, accounts are unlocked so we can use send_transaction via w3.eth.send_transaction
    # But web3.py requires the transaction to be signed, so for simplicity use web3.eth.send_transaction with minimal data
    # We'll call the contract function via transact to let web3 handle it:
    tx_hash = contract.functions.registerCrop(name, ipfs_hash, quantity, harvest_days, price_wei).transact({"from": acct})
    receipt = web3_instance.eth.wait_for_transaction_receipt(tx_hash)
    return receipt

def pin_image_and_get_hash(file_bytes, filename):
    return pin_file_to_pinata(file_bytes, filename)
