import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Package, 
  User, 
  Clock,
  ExternalLink,
  Download,
  Share2,
  QrCode
} from 'lucide-react';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';
import LoadingSpinner from '../components/LoadingSpinner';
import { cropAPI, utils } from '../services/enhanced-api';
import { IPFS_GATEWAY } from '../config';

const CropDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cropData, setCropData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [showQR, setShowQR] = useState(false);

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
      toast.error('Failed to load crop details');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'transferred': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner size="large" text="Loading crop details..." />
      </div>
    );
  }

  if (!cropData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Crop Not Found</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Marketplace
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {cropData.name}
            </h1>
            <p className="text-gray-600">Batch #{cropData.batchNumber}</p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <QrCode size={16} className="mr-2" />
              QR Code
            </button>
            
            <button
              onClick={() => {
                navigator.share({
                  title: `${cropData.name} - Batch ${cropData.batchNumber}`,
                  url: window.location.href
                }).catch(() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied to clipboard');
                });
              }}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <Share2 size={16} className="mr-2" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Crop QR Code</h3>
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block mb-4">
                <QRCode 
                  value={`${window.location.origin}/track/${cropData.id}`}
                  size={200}
                />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code to view crop details and supply chain history
              </p>
              <button
                onClick={() => setShowQR(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'details', label: 'Details', icon: '📋' },
            { id: 'timeline', label: 'Supply Chain', icon: '🔄' },
            { id: 'certificates', label: 'Certificates', icon: '📜' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Crop Image */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {cropData.imageUrl ? (
                <img
                  src={cropData.imageUrl}
                  alt={cropData.name}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                  <span className="text-6xl">🌾</span>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Package size={20} className="text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Quantity</p>
                    <p className="font-medium">{cropData.quantity} units</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <DollarSign size={20} className="text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="font-medium">{utils.formatETH(cropData.price)} ETH</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <User size={20} className="text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Current Owner</p>
                    <p className="font-medium">{formatAddress(cropData.currentOwner)}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cropData.status)}`}>
                    {cropData.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Info */}
          <div className="space-y-6">
            {/* Dates */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Important Dates</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar size={20} className="text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Harvest Date</p>
                    <p className="font-medium">{utils.formatDate(cropData.harvestDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar size={20} className="text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Expiry Date</p>
                    <p className="font-medium">{utils.formatDate(cropData.expiryDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock size={20} className="text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Registered</p>
                    <p className="font-medium">{utils.formatDateTime(cropData.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Farm Location</h3>
              <div className="flex items-center">
                <MapPin size={20} className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Coordinates</p>
                  <p className="font-medium">{cropData.farmCoords}</p>
                </div>
              </div>
            </div>

            {/* Certificates */}
            {cropData.certUrl && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Quality Certificate</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Download size={20} className="text-gray-400 mr-3" />
                    <span className="text-sm text-gray-600">Certificate Available</span>
                  </div>
                  <a
                    href={cropData.certUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Certificate
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-6">Supply Chain Timeline</h3>
          
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
      )}

      {activeTab === 'certificates' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-6">Certificates & Documents</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cropData.imageUrl && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Crop Image</h4>
                <img
                  src={cropData.imageUrl}
                  alt={cropData.name}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <a
                  href={cropData.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Full Image
                </a>
              </div>
            )}
            
            {cropData.certUrl && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Quality Certificate</h4>
                <div className="bg-gray-100 h-32 rounded flex items-center justify-center mb-2">
                  <span className="text-4xl">📜</span>
                </div>
                <a
                  href={cropData.certUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Certificate
                </a>
              </div>
            )}
            
            {!cropData.imageUrl && !cropData.certUrl && (
              <div className="col-span-2 text-center py-8">
                <div className="text-4xl mb-4">📄</div>
                <p className="text-gray-600">No certificates or documents available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CropDetails;
