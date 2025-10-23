// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract EnhancedFoodSupplyChain is AccessControl, Pausable, ReentrancyGuard {
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant CUSTOMER_ROLE = keccak256("CUSTOMER_ROLE");

    // Enhanced Crop struct
    struct Crop {
        uint256 id;
        string name;
        uint256 quantity;
        uint256 price;
        string batchNumber;
        uint256 harvestDate;    // unix timestamp
        uint256 expiryDate;     // unix timestamp
        string ipfsImageHash;   // IPFS CID for image
        string ipfsCertHash;    // IPFS CID for certificate
        string farmCoords;      // GPS coordinates "lat,lng"
        address currentOwner;
        bool available;
        uint256 createdAt;
    }

    // Transfer event for traceability
    struct TransferEvent {
        address from;
        address to;
        uint256 timestamp;
        string note;
        string ipfsDataHash;    // Additional data on IPFS
    }

    // State variables
    uint256 public cropCount = 0;
    mapping(uint256 => Crop) public crops;
    mapping(uint256 => TransferEvent[]) public cropHistory;
    mapping(address => uint256[]) public userCrops; // Crops owned by user

    // Events
    event CropRegistered(
        uint256 indexed cropId, 
        address indexed farmer,
        string name,
        string batchNumber
    );
    
    event CropTransferred(
        uint256 indexed cropId, 
        address indexed from, 
        address indexed to, 
        string note
    );
    
    event CropPurchased(
        uint256 indexed cropId, 
        address indexed buyer, 
        uint256 amount
    );

    event RoleGranted(address indexed user, bytes32 indexed role);
    event RoleRevoked(address indexed user, bytes32 indexed role);

    // Modifiers
    modifier validCrop(uint256 _cropId) {
        require(_cropId > 0 && _cropId <= cropCount, "Invalid crop ID");
        require(crops[_cropId].id != 0, "Crop does not exist");
        _;
    }

    modifier onlyOwnerOrAdmin(uint256 _cropId) {
        require(
            crops[_cropId].currentOwner == msg.sender || hasRole(ADMIN_ROLE, msg.sender),
            "Not owner or admin"
        );
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // Role management functions
    function grantFarmerRole(address _farmer) external onlyRole(ADMIN_ROLE) {
        _grantRole(FARMER_ROLE, _farmer);
        emit RoleGranted(_farmer, FARMER_ROLE);
    }

    function grantDistributorRole(address _distributor) external onlyRole(ADMIN_ROLE) {
        _grantRole(DISTRIBUTOR_ROLE, _distributor);
        emit RoleGranted(_distributor, DISTRIBUTOR_ROLE);
    }

    function grantRetailerRole(address _retailer) external onlyRole(ADMIN_ROLE) {
        _grantRole(RETAILER_ROLE, _retailer);
        emit RoleGranted(_retailer, RETAILER_ROLE);
    }

    function grantCustomerRole(address _customer) external onlyRole(ADMIN_ROLE) {
        _grantRole(CUSTOMER_ROLE, _customer);
        emit RoleGranted(_customer, CUSTOMER_ROLE);
    }

    function revokeUserRole(bytes32 role, address account) external onlyRole(ADMIN_ROLE) {
        _revokeRole(role, account);
        emit RoleRevoked(account, role);
    }

    // Enhanced crop registration
    function registerCrop(
        string memory _name,
        uint256 _quantity,
        uint256 _price,
        string memory _batchNumber,
        uint256 _harvestDate,
        uint256 _expiryDate,
        string memory _ipfsImageHash,
        string memory _ipfsCertHash,
        string memory _farmCoords
    ) external onlyRole(FARMER_ROLE) whenNotPaused {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_quantity > 0, "Quantity must be greater than 0");
        require(_price > 0, "Price must be greater than 0");
        require(bytes(_batchNumber).length > 0, "Batch number cannot be empty");
        require(_harvestDate > 0, "Invalid harvest date");
        require(_expiryDate > _harvestDate, "Expiry date must be after harvest date");
        require(bytes(_farmCoords).length > 0, "Farm coordinates required");

        cropCount++;
        crops[cropCount] = Crop({
            id: cropCount,
            name: _name,
            quantity: _quantity,
            price: _price,
            batchNumber: _batchNumber,
            harvestDate: _harvestDate,
            expiryDate: _expiryDate,
            ipfsImageHash: _ipfsImageHash,
            ipfsCertHash: _ipfsCertHash,
            farmCoords: _farmCoords,
            currentOwner: msg.sender,
            available: true,
            createdAt: block.timestamp
        });

        userCrops[msg.sender].push(cropCount);

        emit CropRegistered(cropCount, msg.sender, _name, _batchNumber);
    }

    // Transfer crop ownership
    function transferCrop(
        uint256 _cropId,
        address _to,
        string memory _note,
        string memory _ipfsDataHash
    ) external validCrop(_cropId) onlyOwnerOrAdmin(_cropId) whenNotPaused {
        require(_to != address(0), "Cannot transfer to zero address");
        require(_to != crops[_cropId].currentOwner, "Cannot transfer to current owner");
        require(crops[_cropId].available, "Crop not available for transfer");

        address from = crops[_cropId].currentOwner;
        
        // Update ownership
        crops[_cropId].currentOwner = _to;
        
        // Add to new owner's crops
        userCrops[_to].push(_cropId);
        
        // Remove from old owner's crops (simplified - in production, use mapping)
        
        // Record transfer event
        cropHistory[_cropId].push(TransferEvent({
            from: from,
            to: _to,
            timestamp: block.timestamp,
            note: _note,
            ipfsDataHash: _ipfsDataHash
        }));

        emit CropTransferred(_cropId, from, _to, _note);
    }

    // Purchase crop
    function buyCrop(uint256 _cropId) external payable validCrop(_cropId) nonReentrant whenNotPaused {
        Crop storage crop = crops[_cropId];
        require(crop.available, "Crop not available");
        require(msg.value >= crop.price, "Insufficient payment");
        require(msg.sender != crop.currentOwner, "Cannot buy your own crop");

        address seller = crop.currentOwner;
        
        // Update crop status
        crop.available = false;
        crop.currentOwner = msg.sender;
        
        // Add to buyer's crops
        userCrops[msg.sender].push(_cropId);
        
        // Record purchase event
        cropHistory[_cropId].push(TransferEvent({
            from: seller,
            to: msg.sender,
            timestamp: block.timestamp,
            note: "Purchase transaction",
            ipfsDataHash: ""
        }));

        // Transfer payment to seller
        payable(seller).transfer(crop.price);
        
        // Refund excess payment
        if (msg.value > crop.price) {
            payable(msg.sender).transfer(msg.value - crop.price);
        }

        emit CropPurchased(_cropId, msg.sender, crop.price);
    }

    // View functions
    function getCrop(uint256 _cropId) external view validCrop(_cropId) returns (Crop memory) {
        return crops[_cropId];
    }

    function getCropHistory(uint256 _cropId) external view validCrop(_cropId) returns (TransferEvent[] memory) {
        return cropHistory[_cropId];
    }

    function getUserCrops(address _user) external view returns (uint256[] memory) {
        return userCrops[_user];
    }

    function getAllCrops() external view returns (Crop[] memory) {
        Crop[] memory allCrops = new Crop[](cropCount);
        for (uint256 i = 1; i <= cropCount; i++) {
            allCrops[i - 1] = crops[i];
        }
        return allCrops;
    }

    function getAvailableCrops() external view returns (Crop[] memory) {
        uint256 availableCount = 0;
        
        // Count available crops
        for (uint256 i = 1; i <= cropCount; i++) {
            if (crops[i].available) {
                availableCount++;
            }
        }
        
        Crop[] memory availableCrops = new Crop[](availableCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= cropCount; i++) {
            if (crops[i].available) {
                availableCrops[index] = crops[i];
                index++;
            }
        }
        
        return availableCrops;
    }

    // Admin functions
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    // Emergency functions
    function emergencyWithdraw() external onlyRole(ADMIN_ROLE) {
        payable(msg.sender).transfer(address(this).balance);
    }
}
