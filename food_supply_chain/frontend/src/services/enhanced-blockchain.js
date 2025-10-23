import { BrowserProvider, Contract } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";

class EnhancedBlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.account = null;
  }

  // Initialize connection to blockchain
  async initialize() {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not installed");
      }

      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });
      
      // Create provider and signer
      this.provider = new BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.account = await this.signer.getAddress();
      
      // Create contract instance
      this.contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);
      
      console.log("Blockchain service initialized");
      console.log("Account:", this.account);
      console.log("Contract:", CONTRACT_ADDRESS);
      
      return {
        success: true,
        account: this.account,
        contract: this.contract
      };
    } catch (error) {
      console.error("Failed to initialize blockchain:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check if connected
  isConnected() {
    return this.provider && this.signer && this.contract;
  }

  // Get current account
  getAccount() {
    return this.account;
  }

  // Get contract instance
  getContract() {
    return this.contract;
  }

  // Register a crop
  async registerCrop(cropData) {
    try {
      if (!this.isConnected()) {
        throw new Error("Not connected to blockchain");
      }

      console.log("Registering crop:", cropData);

      const tx = await this.contract.registerCrop(
        cropData.name,
        cropData.quantity,
        cropData.price,
        cropData.batchNumber,
        cropData.harvestDate,
        cropData.expiryDate,
        cropData.ipfsImageHash || "",
        cropData.ipfsCertHash || "",
        cropData.farmCoords
      );

      console.log("Transaction sent:", tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed
      };
    } catch (error) {
      console.error("Failed to register crop:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Transfer crop ownership
  async transferCrop(cropId, toAddress, note = "", ipfsDataHash = "") {
    try {
      if (!this.isConnected()) {
        throw new Error("Not connected to blockchain");
      }

      console.log("Transferring crop:", { cropId, toAddress, note });

      const tx = await this.contract.transferCrop(
        cropId,
        toAddress,
        note,
        ipfsDataHash
      );

      console.log("Transfer transaction sent:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("Transfer confirmed:", receipt);

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed
      };
    } catch (error) {
      console.error("Failed to transfer crop:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Buy a crop
  async buyCrop(cropId, paymentAmount) {
    try {
      if (!this.isConnected()) {
        throw new Error("Not connected to blockchain");
      }

      console.log("Buying crop:", { cropId, paymentAmount });

      const tx = await this.contract.buyCrop(cropId, {
        value: paymentAmount
      });

      console.log("Purchase transaction sent:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("Purchase confirmed:", receipt);

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed
      };
    } catch (error) {
      console.error("Failed to buy crop:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get crop details
  async getCrop(cropId) {
    try {
      if (!this.isConnected()) {
        throw new Error("Not connected to blockchain");
      }

      const cropData = await this.contract.getCrop(cropId);
      
      return {
        success: true,
        data: {
          id: cropData[0].toString(),
          name: cropData[1],
          quantity: cropData[2].toString(),
          price: cropData[3].toString(),
          batchNumber: cropData[4],
          harvestDate: cropData[5].toString(),
          expiryDate: cropData[6].toString(),
          ipfsImageHash: cropData[7],
          ipfsCertHash: cropData[8],
          farmCoords: cropData[9],
          currentOwner: cropData[10],
          available: cropData[11],
          createdAt: cropData[12].toString()
        }
      };
    } catch (error) {
      console.error("Failed to get crop:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get all crops
  async getAllCrops() {
    try {
      if (!this.isConnected()) {
        throw new Error("Not connected to blockchain");
      }

      const crops = await this.contract.getAllCrops();
      
      const formattedCrops = crops.map(crop => ({
        id: crop[0].toString(),
        name: crop[1],
        quantity: crop[2].toString(),
        price: crop[3].toString(),
        batchNumber: crop[4],
        harvestDate: crop[5].toString(),
        expiryDate: crop[6].toString(),
        ipfsImageHash: crop[7],
        ipfsCertHash: crop[8],
        farmCoords: crop[9],
        currentOwner: crop[10],
        available: crop[11],
        createdAt: crop[12].toString()
      }));

      return {
        success: true,
        data: formattedCrops
      };
    } catch (error) {
      console.error("Failed to get crops:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get available crops only
  async getAvailableCrops() {
    try {
      if (!this.isConnected()) {
        throw new Error("Not connected to blockchain");
      }

      const crops = await this.contract.getAvailableCrops();
      
      const formattedCrops = crops.map(crop => ({
        id: crop[0].toString(),
        name: crop[1],
        quantity: crop[2].toString(),
        price: crop[3].toString(),
        batchNumber: crop[4],
        harvestDate: crop[5].toString(),
        expiryDate: crop[6].toString(),
        ipfsImageHash: crop[7],
        ipfsCertHash: crop[8],
        farmCoords: crop[9],
        currentOwner: crop[10],
        available: crop[11],
        createdAt: crop[12].toString()
      }));

      return {
        success: true,
        data: formattedCrops
      };
    } catch (error) {
      console.error("Failed to get available crops:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get crop history
  async getCropHistory(cropId) {
    try {
      if (!this.isConnected()) {
        throw new Error("Not connected to blockchain");
      }

      const history = await this.contract.getCropHistory(cropId);
      
      const formattedHistory = history.map(event => ({
        from: event[0],
        to: event[1],
        timestamp: event[2].toString(),
        note: event[3],
        ipfsDataHash: event[4]
      }));

      return {
        success: true,
        data: formattedHistory
      };
    } catch (error) {
      console.error("Failed to get crop history:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get crop count
  async getCropCount() {
    try {
      if (!this.isConnected()) {
        throw new Error("Not connected to blockchain");
      }

      const count = await this.contract.cropCount();
      return {
        success: true,
        data: count.toString()
      };
    } catch (error) {
      console.error("Failed to get crop count:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get account balance
  async getBalance(address = null) {
    try {
      if (!this.isConnected()) {
        throw new Error("Not connected to blockchain");
      }

      const targetAddress = address || this.account;
      const balance = await this.provider.getBalance(targetAddress);
      
      return {
        success: true,
        data: balance.toString()
      };
    } catch (error) {
      console.error("Failed to get balance:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Listen to contract events
  async listenToEvents(eventName, callback) {
    try {
      if (!this.isConnected()) {
        throw new Error("Not connected to blockchain");
      }

      this.contract.on(eventName, callback);
      
      return {
        success: true,
        message: `Listening to ${eventName} events`
      };
    } catch (error) {
      console.error("Failed to listen to events:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Stop listening to events
  async stopListening(eventName = null) {
    try {
      if (!this.isConnected()) {
        throw new Error("Not connected to blockchain");
      }

      if (eventName) {
        this.contract.removeAllListeners(eventName);
      } else {
        this.contract.removeAllListeners();
      }
      
      return {
        success: true,
        message: `Stopped listening to ${eventName || 'all'} events`
      };
    } catch (error) {
      console.error("Failed to stop listening:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const blockchainService = new EnhancedBlockchainService();

export default blockchainService;
