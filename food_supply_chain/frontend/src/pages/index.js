import React from 'react';
import { User } from 'lucide-react';

const FarmerDashboard = ({ userProfile }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <span className="text-3xl">🌾</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Farmer Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome, {userProfile?.name || 'Farmer'}!</p>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-4">Coming Soon!</h2>
          <p className="text-gray-600">
            Your farmer dashboard will include crop registration, inventory management, and analytics.
          </p>
        </div>
      </div>
    </div>
  );
};

const DistributorDashboard = ({ userProfile }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
          <span className="text-3xl">🚚</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Distributor Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome, {userProfile?.name || 'Distributor'}!</p>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-4">Coming Soon!</h2>
          <p className="text-gray-600">
            Your distributor dashboard will include inventory management and transfer tracking.
          </p>
        </div>
      </div>
    </div>
  );
};

const RetailerDashboard = ({ userProfile }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-4">
          <span className="text-3xl">🏪</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Retailer Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome, {userProfile?.name || 'Retailer'}!</p>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-4">Coming Soon!</h2>
          <p className="text-gray-600">
            Your retailer dashboard will include store management and order tracking.
          </p>
        </div>
      </div>
    </div>
  );
};

const CustomerDashboard = ({ userProfile }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
          <span className="text-3xl">🛒</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome, {userProfile?.name || 'Customer'}!</p>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-4">Coming Soon!</h2>
          <p className="text-gray-600">
            Your customer dashboard will include order history and QR code scanning.
          </p>
        </div>
      </div>
    </div>
  );
};

const CropDetails = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Crop Details</h1>
        <p className="text-gray-600 mb-8">Detailed crop information and history</p>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-4">Coming Soon!</h2>
          <p className="text-gray-600">
            This page will show detailed crop information, images, certificates, and supply chain history.
          </p>
        </div>
      </div>
    </div>
  );
};

const SupplyChainTracking = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Supply Chain Tracking</h1>
        <p className="text-gray-600 mb-8">Track the journey of your crops</p>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-4">Coming Soon!</h2>
          <p className="text-gray-600">
            This page will show a visual timeline of crop transfers and supply chain events.
          </p>
        </div>
      </div>
    </div>
  );
};

// Import CropRegistration
import CropRegistration from './CropRegistration';

export {
  FarmerDashboard,
  DistributorDashboard,
  RetailerDashboard,
  CustomerDashboard,
  CropDetails,
  SupplyChainTracking,
  CropRegistration
};
