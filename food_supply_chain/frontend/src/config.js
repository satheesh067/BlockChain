// Enhanced frontend configuration
export const BACKEND_URL = "http://127.0.0.1:8000";
export const API_BASE_URL = `${BACKEND_URL}/api`;

// Enhanced contract configuration
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// User roles
export const USER_ROLES = {
  ADMIN: "admin",
  FARMER: "farmer", 
  DISTRIBUTOR: "distributor",
  RETAILER: "retailer",
  CUSTOMER: "customer"
};

// Enhanced contract ABI (simplified for frontend)
export const CONTRACT_ABI = [
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "cropId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "farmer", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "batchNumber", "type": "string"}
    ],
    "name": "CropRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "cropId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "from", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "note", "type": "string"}
    ],
    "name": "CropTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "cropId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "buyer", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "CropPurchased",
    "type": "event"
  },
  // Functions
  {
    "inputs": [
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "uint256", "name": "_quantity", "type": "uint256"},
      {"internalType": "uint256", "name": "_price", "type": "uint256"},
      {"internalType": "string", "name": "_batchNumber", "type": "string"},
      {"internalType": "uint256", "name": "_harvestDate", "type": "uint256"},
      {"internalType": "uint256", "name": "_expiryDate", "type": "uint256"},
      {"internalType": "string", "name": "_ipfsImageHash", "type": "string"},
      {"internalType": "string", "name": "_ipfsCertHash", "type": "string"},
      {"internalType": "string", "name": "_farmCoords", "type": "string"}
    ],
    "name": "registerCrop",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_cropId", "type": "uint256"},
      {"internalType": "address", "name": "_to", "type": "address"},
      {"internalType": "string", "name": "_note", "type": "string"},
      {"internalType": "string", "name": "_ipfsDataHash", "type": "string"}
    ],
    "name": "transferCrop",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_cropId", "type": "uint256"}],
    "name": "buyCrop",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_cropId", "type": "uint256"}],
    "name": "getCrop",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"},
      {"internalType": "string", "name": "", "type": "string"},
      {"internalType": "uint256", "name": "", "type": "uint256"},
      {"internalType": "uint256", "name": "", "type": "uint256"},
      {"internalType": "string", "name": "", "type": "string"},
      {"internalType": "uint256", "name": "", "type": "uint256"},
      {"internalType": "uint256", "name": "", "type": "uint256"},
      {"internalType": "string", "name": "", "type": "string"},
      {"internalType": "string", "name": "", "type": "string"},
      {"internalType": "string", "name": "", "type": "string"},
      {"internalType": "address", "name": "", "type": "address"},
      {"internalType": "bool", "name": "", "type": "bool"},
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllCrops",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "uint256", "name": "quantity", "type": "uint256"},
          {"internalType": "uint256", "name": "price", "type": "uint256"},
          {"internalType": "string", "name": "batchNumber", "type": "string"},
          {"internalType": "uint256", "name": "harvestDate", "type": "uint256"},
          {"internalType": "uint256", "name": "expiryDate", "type": "uint256"},
          {"internalType": "string", "name": "ipfsImageHash", "type": "string"},
          {"internalType": "string", "name": "ipfsCertHash", "type": "string"},
          {"internalType": "string", "name": "farmCoords", "type": "string"},
          {"internalType": "address", "name": "currentOwner", "type": "address"},
          {"internalType": "bool", "name": "available", "type": "bool"},
          {"internalType": "uint256", "name": "createdAt", "type": "uint256"}
        ],
        "internalType": "struct EnhancedFoodSupplyChain.Crop",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAvailableCrops",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "uint256", "name": "quantity", "type": "uint256"},
          {"internalType": "uint256", "name": "price", "type": "uint256"},
          {"internalType": "string", "name": "batchNumber", "type": "string"},
          {"internalType": "uint256", "name": "harvestDate", "type": "uint256"},
          {"internalType": "uint256", "name": "expiryDate", "type": "uint256"},
          {"internalType": "string", "name": "ipfsImageHash", "type": "string"},
          {"internalType": "string", "name": "ipfsCertHash", "type": "string"},
          {"internalType": "string", "name": "farmCoords", "type": "string"},
          {"internalType": "address", "name": "currentOwner", "type": "address"},
          {"internalType": "bool", "name": "available", "type": "bool"},
          {"internalType": "uint256", "name": "createdAt", "type": "uint256"}
        ],
        "internalType": "struct EnhancedFoodSupplyChain.Crop",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_cropId", "type": "uint256"}],
    "name": "getCropHistory",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "from", "type": "address"},
          {"internalType": "address", "name": "to", "type": "address"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
          {"internalType": "string", "name": "note", "type": "string"},
          {"internalType": "string", "name": "ipfsDataHash", "type": "string"}
        ],
        "internalType": "struct EnhancedFoodSupplyChain.TransferEvent",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "cropCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// IPFS Configuration
export const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

// File upload configuration
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
