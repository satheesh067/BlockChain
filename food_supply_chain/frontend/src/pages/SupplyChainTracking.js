import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Package, 
  User, 
  Clock,
  ExternalLink,
  Shield,
  CheckCircle
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { cropAPI, utils } from '../services/enhanced-api';
import { IPFS_GATEWAY } from '../config';

const SupplyChainTracking = () => {
  const { id } = useParams();
  const [cropData, setCropData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCropData();
  }, [id]);

  const loadCropData = async () => {
    try {
      setIsLoading(true);
      
      // Load crop details and history in parallel
      const [crop, history] = await Promise.all([
        cropAPI.getById(id),
        cropAPI.getHistory(id)
      ]);
      
      setCropData(crop);
      setHistoryData(history);
    } catch (error) {
      console.error('Failed to load crop data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'registration': return '🌱';
      case 'transfer': return '🔄';
      case 'purchase': return '💰';
      case 'quality_check': return '✅';
      default: return '📝';
    }
  };

  const TimelineEvent = ({ event, index, isLast }) => {
    const eventType = event.note?.toLowerCase().includes('purchase') ? 'purchase' : 
                     event.note?.toLowerCase().includes('transfer') ? 'transfer' : 'registration';
    
    return (
      <div className="flex items-start space-x-4">
        {/* Timeline line */}
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm">
            {getEventIcon(eventType)}
          </div>
          {!isLast && (
            <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>
          )}
        </div>

        {/* Event content */}
        <div className="flex-1 pb-8">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-gray-900 capitalize">
                {eventType.replace('_', ' ')}
              </h4>
              <span className="text-sm text-gray-500">
                {utils.formatDateTime(event.timestamp)}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <User size={14} />
                <span>From: {formatAddress(event.from_address)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <User size={14} />
                <span>To: {formatAddress(event.to_address)}</span>
              </div>
              
              {event.note && (
                <div className="flex items-start space-x-2">
                  <span className="mt-0.5">📝</span>
                  <span>{event.note}</span>
                </div>
              )}
              
              {event.ipfs_data_hash && (
                <div className="flex items-center space-x-2">
                  <ExternalLink size={14} />
                  <a 
                    href={`${IPFS_GATEWAY}${event.ipfs_data_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Additional Data
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading supply chain data..." />
      </div>
    );
  }

  if (!cropData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Crop Not Found</h1>
          <p className="text-gray-600">The requested crop could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Supply Chain Verification
          </h1>
          <p className="text-gray-600">
            Authentic blockchain-verified crop information
          </p>
        </div>

        {/* Verification Badge */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span className="text-lg font-semibold text-green-600">
              ✓ Blockchain Verified
            </span>
          </div>
          <p className="text-center text-gray-600 mt-2">
            This information is stored on the blockchain and cannot be tampered with
          </p>
        </div>

        {/* Crop Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            {cropData.imageUrl ? (
              <img
                src={cropData.imageUrl}
                alt={cropData.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🌾</span>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{cropData.name}</h2>
              <p className="text-gray-600">Batch #{cropData.batchNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Package className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Quantity</p>
              <p className="font-semibold">{cropData.quantity}</p>
            </div>
            
            <div className="text-center">
              <DollarSign className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Price</p>
              <p className="font-semibold">{utils.formatETH(cropData.price)} ETH</p>
            </div>
            
            <div className="text-center">
              <Calendar className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Harvest</p>
              <p className="font-semibold">{utils.formatDate(cropData.harvestDate)}</p>
            </div>
            
            <div className="text-center">
              <MapPin className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Farm</p>
              <p className="font-semibold">{cropData.farmCoords}</p>
            </div>
          </div>
        </div>

        {/* Supply Chain Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Supply Chain Journey
          </h3>
          
          {historyData && historyData.history.length > 0 ? (
            <div className="space-y-4">
              {historyData.history.map((event, index) => (
                <TimelineEvent
                  key={index}
                  event={event}
                  index={index}
                  isLast={index === historyData.history.length - 1}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-gray-600">No supply chain events recorded yet</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Powered by blockchain technology for transparent food supply chains</p>
          <p className="mt-1">Crop ID: {cropData.id} | Contract: {cropData.currentOwner}</p>
        </div>
      </div>
    </div>
  );
};

export default SupplyChainTracking;
