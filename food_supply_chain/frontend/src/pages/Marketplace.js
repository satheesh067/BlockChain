import React, { useEffect, useState } from 'react';
import { Search, Filter, MapPin, Calendar, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { cropAPI, utils } from '../services/enhanced-api';
import { IPFS_GATEWAY } from '../config';

const Marketplace = () => {
  const [crops, setCrops] = useState([]);
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadCrops();
  }, []);

  useEffect(() => {
    filterAndSortCrops();
  }, [crops, searchTerm, sortBy]);

  const loadCrops = async () => {
    try {
      setIsLoading(true);
      const availableCrops = await cropAPI.getAvailable();
      setCrops(availableCrops);
    } catch (error) {
      console.error('Failed to load crops:', error);
      toast.error('Failed to load crops');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortCrops = () => {
    let filtered = crops.filter(crop =>
      crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crop.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort crops
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt * 1000) - new Date(a.createdAt * 1000);
        case 'oldest':
          return new Date(a.createdAt * 1000) - new Date(b.createdAt * 1000);
        case 'price-low':
          return parseInt(a.price) - parseInt(b.price);
        case 'price-high':
          return parseInt(b.price) - parseInt(a.price);
        case 'expiry':
          return new Date(a.expiryDate * 1000) - new Date(b.expiryDate * 1000);
        default:
          return 0;
      }
    });

    setFilteredCrops(filtered);
  };

  const CropCard = ({ crop }) => {
    const isExpiringSoon = () => {
      const expiryDate = new Date(crop.expiryDate * 1000);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    };

    const isExpired = () => {
      const expiryDate = new Date(crop.expiryDate * 1000);
      const now = new Date();
      return expiryDate < now;
    };

    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
        {/* Crop Image */}
        <div className="h-48 bg-gray-200 relative">
          {crop.imageUrl ? (
            <img
              src={crop.imageUrl}
              alt={crop.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`${crop.imageUrl ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-gray-400`}>
            <span className="text-4xl">🌾</span>
          </div>
          
          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            {isExpired() ? (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                Expired
              </span>
            ) : isExpiringSoon() ? (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                Expiring Soon
              </span>
            ) : (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Fresh
              </span>
            )}
          </div>
        </div>

        {/* Crop Info */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{crop.name}</h3>
            <span className="text-sm text-gray-500">#{crop.batchNumber}</span>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <DollarSign size={14} className="mr-2" />
              <span className="font-medium">{utils.formatETH(crop.price)} ETH</span>
            </div>
            
            <div className="flex items-center">
              <span className="mr-2">📦</span>
              <span>Quantity: {crop.quantity}</span>
            </div>

            <div className="flex items-center">
              <Calendar size={14} className="mr-2" />
              <span>Harvest: {utils.formatDate(crop.harvestDate)}</span>
            </div>

            <div className="flex items-center">
              <Calendar size={14} className="mr-2" />
              <span>Expires: {utils.formatDate(crop.expiryDate)}</span>
            </div>

            <div className="flex items-center">
              <MapPin size={14} className="mr-2" />
              <span className="truncate">{crop.farmCoords}</span>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => window.location.href = `/crop/${crop.id}`}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              View Details →
            </button>
            
            <button
              onClick={() => window.location.href = `/track/${crop.id}`}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Track Supply Chain
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner size="large" text="Loading marketplace..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🌾 Marketplace</h1>
        <p className="text-gray-600">Discover fresh crops from verified farmers</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search crops by name or batch number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="md:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="expiry">Expiry Date</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">🌾</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Crops</p>
              <p className="text-2xl font-bold text-gray-900">{crops.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">{filteredCrops.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Price</p>
              <p className="text-2xl font-bold text-gray-900">
                {crops.length > 0 
                  ? utils.formatETH(crops.reduce((sum, crop) => sum + parseInt(crop.price), 0) / crops.length)
                  : '0'
                } ETH
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Crops Grid */}
      {filteredCrops.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No crops found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms' : 'No crops are currently available'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => (
            <CropCard key={crop.id} crop={crop} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
