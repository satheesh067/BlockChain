import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, History, FileText } from 'lucide-react';
import blockchainService from '../services/enhanced-blockchain';
import { formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';

const FarmerDashboard = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCrops: 0,
    activeCrops: 0,
    soldCrops: 0,
    totalValue: 0
  });

  useEffect(() => {
    loadFarmerCrops();
  }, []);

  const loadFarmerCrops = async () => {
    try {
      setLoading(true);
      const account = await blockchainService.getCurrentAccount();
      const userCrops = await blockchainService.getUserCrops(account);
      
      setCrops(userCrops);
      
      // Calculate stats
      const activeCrops = userCrops.filter(crop => crop.available);
      const soldCrops = userCrops.filter(crop => !crop.available);
      const totalValue = userCrops.reduce((sum, crop) => sum + Number(crop.price), 0);
      
      setStats({
        totalCrops: userCrops.length,
        activeCrops: activeCrops.length,
        soldCrops: soldCrops.length,
        totalValue: totalValue
      });
      
    } catch (error) {
      console.error("Failed to load farmer crops:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">Farmer Dashboard</h1>
        <Link 
          to="/crop/register" 
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="mr-2" size={18} />
          Register New Crop
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium">Total Crops</h3>
          <p className="text-3xl font-bold">{stats.totalCrops}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium">Active Listings</h3>
          <p className="text-3xl font-bold">{stats.activeCrops}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-medium">Sold Crops</h3>
          <p className="text-3xl font-bold">{stats.soldCrops}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <h3 className="text-gray-500 text-sm font-medium">Total Value (ETH)</h3>
          <p className="text-3xl font-bold">{stats.totalValue / 1e18}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button className="border-green-500 text-green-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              My Crops
            </button>
            <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Transfer History
            </button>
            <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Certificates
            </button>
          </nav>
        </div>
      </div>

      {/* Crops List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : crops.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No crops registered</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by registering your first crop.</p>
          <div className="mt-6">
            <Link
              to="/crop/register"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Register New Crop
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {crops.map((crop) => (
              <li key={crop.id}>
                <Link to={`/crop/${crop.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {crop.ipfsImageHash ? (
                          <img 
                            src={`https://ipfs.io/ipfs/${crop.ipfsImageHash}`} 
                            alt={crop.name}
                            className="h-16 w-16 rounded-md object-cover mr-4"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-md bg-gray-200 mr-4 flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-green-600 truncate">{crop.name}</p>
                          <p className="flex items-center text-sm text-gray-500">
                            <span>Batch: {crop.batchNumber}</span>
                            <span className="mx-2">•</span>
                            <span>Quantity: {crop.quantity}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-sm font-semibold text-gray-900">{crop.price / 1e18} ETH</p>
                        <p className="text-sm text-gray-500">
                          {crop.available ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Available
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Sold
                            </span>
                          )}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Expires: {formatDate(crop.expiryDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;