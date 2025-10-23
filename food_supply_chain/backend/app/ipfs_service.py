import os
import requests
import ipfshttpclient
from typing import Optional, Dict, Any
from . import config

class IPFSService:
    def __init__(self):
        self.use_pinata = config.USE_PINATA
        self.pinata_api_key = config.PINATA_API_KEY
        self.pinata_secret = config.PINATA_SECRET
        self.ipfs_url = config.IPFS_URL
        
        # Initialize IPFS client if not using Pinata
        if not self.use_pinata:
            try:
                self.ipfs_client = ipfshttpclient.connect(self.ipfs_url)
            except Exception as e:
                print(f"Warning: Could not connect to IPFS node at {self.ipfs_url}")
                print(f"Error: {e}")
                self.ipfs_client = None

    def upload_file(self, file_path: str, file_name: str = None) -> Optional[str]:
        """
        Upload a file to IPFS and return the hash (CID)
        """
        if self.use_pinata:
            return self._upload_to_pinata(file_path, file_name)
        else:
            return self._upload_to_local_ipfs(file_path, file_name)

    def upload_bytes(self, file_bytes: bytes, file_name: str) -> Optional[str]:
        """
        Upload file bytes to IPFS and return the hash (CID)
        """
        if self.use_pinata:
            return self._upload_bytes_to_pinata(file_bytes, file_name)
        else:
            return self._upload_bytes_to_local_ipfs(file_bytes, file_name)

    def _upload_to_pinata(self, file_path: str, file_name: str = None) -> Optional[str]:
        """
        Upload file to Pinata IPFS service
        """
        if not self.pinata_api_key or not self.pinata_secret:
            print("Pinata API credentials not configured")
            return None

        try:
            url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
            
            headers = {
                'pinata_api_key': self.pinata_api_key,
                'pinata_secret_api_key': self.pinata_secret,
            }

            with open(file_path, 'rb') as f:
                files = {
                    'file': (file_name or os.path.basename(file_path), f)
                }
                
                response = requests.post(url, files=files, headers=headers)
                
            if response.status_code == 200:
                result = response.json()
                return result['IpfsHash']
            else:
                print(f"Pinata upload failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"Error uploading to Pinata: {e}")
            return None

    def _upload_bytes_to_pinata(self, file_bytes: bytes, file_name: str) -> Optional[str]:
        """
        Upload file bytes to Pinata IPFS service
        """
        if not self.pinata_api_key or not self.pinata_secret:
            print("Pinata API credentials not configured")
            return None

        try:
            url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
            
            headers = {
                'pinata_api_key': self.pinata_api_key,
                'pinata_secret_api_key': self.pinata_secret,
            }

            files = {
                'file': (file_name, file_bytes)
            }
            
            response = requests.post(url, files=files, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                return result['IpfsHash']
            else:
                print(f"Pinata upload failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"Error uploading to Pinata: {e}")
            return None

    def _upload_to_local_ipfs(self, file_path: str, file_name: str = None) -> Optional[str]:
        """
        Upload file to local IPFS node
        """
        if not self.ipfs_client:
            print("IPFS client not available")
            return None

        try:
            result = self.ipfs_client.add(file_path)
            return result['Hash']
        except Exception as e:
            print(f"Error uploading to local IPFS: {e}")
            return None

    def _upload_bytes_to_local_ipfs(self, file_bytes: bytes, file_name: str) -> Optional[str]:
        """
        Upload file bytes to local IPFS node
        """
        if not self.ipfs_client:
            print("IPFS client not available")
            return None

        try:
            result = self.ipfs_client.add_bytes(file_bytes)
            return result
        except Exception as e:
            print(f"Error uploading bytes to local IPFS: {e}")
            return None

    def get_file_url(self, ipfs_hash: str) -> str:
        """
        Get the URL to access a file from IPFS
        """
        if self.use_pinata:
            return f"https://gateway.pinata.cloud/ipfs/{ipfs_hash}"
        else:
            return f"https://ipfs.io/ipfs/{ipfs_hash}"

    def pin_file(self, ipfs_hash: str) -> bool:
        """
        Pin a file to ensure it stays available
        """
        if self.use_pinata:
            return self._pin_to_pinata(ipfs_hash)
        else:
            return self._pin_to_local_ipfs(ipfs_hash)

    def _pin_to_pinata(self, ipfs_hash: str) -> bool:
        """
        Pin file to Pinata
        """
        if not self.pinata_api_key or not self.pinata_secret:
            return False

        try:
            url = "https://api.pinata.cloud/pinning/pinByHash"
            
            headers = {
                'Content-Type': 'application/json',
                'pinata_api_key': self.pinata_api_key,
                'pinata_secret_api_key': self.pinata_secret,
            }

            data = {
                'hashToPin': ipfs_hash,
                'pinataMetadata': {
                    'name': f'Crop Document {ipfs_hash}'
                }
            }
            
            response = requests.post(url, json=data, headers=headers)
            return response.status_code == 200
            
        except Exception as e:
            print(f"Error pinning to Pinata: {e}")
            return False

    def _pin_to_local_ipfs(self, ipfs_hash: str) -> bool:
        """
        Pin file to local IPFS node
        """
        if not self.ipfs_client:
            return False

        try:
            self.ipfs_client.pin.add(ipfs_hash)
            return True
        except Exception as e:
            print(f"Error pinning to local IPFS: {e}")
            return False

# Global IPFS service instance
ipfs_service = IPFSService()
