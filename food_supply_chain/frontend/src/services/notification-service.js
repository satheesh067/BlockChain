import { toast } from 'react-hot-toast';

class NotificationService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.isConnected = false;
  }

  connect() {
    try {
      const wsUrl = process.env.NODE_ENV === 'production' 
        ? 'wss://your-production-domain.com/ws'
        : 'ws://localhost:8001/ws';
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        toast.success('Connected to real-time updates');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error');
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      toast.error('Failed to connect to real-time updates');
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.log('Max reconnection attempts reached');
      toast.error('Lost connection to real-time updates');
    }
  }

  handleMessage(data) {
    const { type, payload } = data;
    
    switch (type) {
      case 'crop_registered':
        this.handleCropRegistered(payload);
        break;
      case 'crop_transferred':
        this.handleCropTransferred(payload);
        break;
      case 'crop_purchased':
        this.handleCropPurchased(payload);
        break;
      case 'role_granted':
        this.handleRoleGranted(payload);
        break;
      case 'system_notification':
        this.handleSystemNotification(payload);
        break;
      default:
        console.log('Unknown message type:', type);
    }

    // Notify all listeners
    this.listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  handleCropRegistered(payload) {
    const { cropId, cropName, farmerAddress } = payload;
    toast.success(
      `🌱 New crop registered: ${cropName} (ID: ${cropId})`,
      { duration: 5000 }
    );
  }

  handleCropTransferred(payload) {
    const { cropId, cropName, fromAddress, toAddress, note } = payload;
    toast.info(
      `🔄 Crop transferred: ${cropName} (ID: ${cropId})`,
      { duration: 5000 }
    );
  }

  handleCropPurchased(payload) {
    const { cropId, cropName, buyerAddress, amount } = payload;
    toast.success(
      `💰 Crop purchased: ${cropName} (ID: ${cropId})`,
      { duration: 5000 }
    );
  }

  handleRoleGranted(payload) {
    const { role, userAddress } = payload;
    toast.success(
      `👤 Role granted: ${role} to ${userAddress.slice(0, 6)}...`,
      { duration: 4000 }
    );
  }

  handleSystemNotification(payload) {
    const { message, level = 'info' } = payload;
    
    switch (level) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        toast(message, { icon: '⚠️' });
        break;
      default:
        toast(message);
    }
  }

  subscribe(listenerId, callback) {
    this.listeners.set(listenerId, callback);
  }

  unsubscribe(listenerId) {
    this.listeners.delete(listenerId);
  }

  sendMessage(message) {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  // Blockchain event listeners
  async subscribeToBlockchainEvents(contract, userAddress) {
    if (!contract || !userAddress) return;

    try {
      // Listen for crop registration events
      contract.on('CropRegistered', (cropId, farmer, name, batchNumber, event) => {
        if (farmer.toLowerCase() !== userAddress.toLowerCase()) {
          this.handleMessage({
            type: 'crop_registered',
            payload: {
              cropId: cropId.toString(),
              cropName: name,
              farmerAddress: farmer,
              batchNumber,
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber
            }
          });
        }
      });

      // Listen for crop transfer events
      contract.on('CropTransferred', (cropId, from, to, note, event) => {
        this.handleMessage({
          type: 'crop_transferred',
          payload: {
            cropId: cropId.toString(),
            fromAddress: from,
            toAddress: to,
            note,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          }
        });
      });

      // Listen for crop purchase events
      contract.on('CropPurchased', (cropId, buyer, amount, event) => {
        this.handleMessage({
          type: 'crop_purchased',
          payload: {
            cropId: cropId.toString(),
            buyerAddress: buyer,
            amount: amount.toString(),
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          }
        });
      });

      // Note: RoleGranted event doesn't exist in our contract
      // Role management is handled through OpenZeppelin's AccessControl
      // which doesn't emit custom events for role grants

      console.log('Subscribed to blockchain events');
    } catch (error) {
      console.error('Failed to subscribe to blockchain events:', error);
    }
  }

  // Utility methods
  formatAddress(address) {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  formatETH(weiAmount) {
    return (parseInt(weiAmount) / 1e18).toFixed(4);
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
