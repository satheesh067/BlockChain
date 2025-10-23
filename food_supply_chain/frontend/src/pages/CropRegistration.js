import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Image, 
  FileText, 
  MapPin, 
  Calendar, 
  Package,
  X,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cropAPI, fileAPI, userAPI, utils } from '../services/enhanced-api';
import blockchainService from '../services/enhanced-blockchain';
import { MAX_FILE_SIZE } from '../config';

const CropRegistration = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    price: '',
    batchNumber: '',
    harvestDate: '',
    expiryDate: '',
    farmCoords: '',
    ipfsImageHash: '',
    ipfsCertHash: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState({ image: null, certificate: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file upload
  const handleFileUpload = async (file, type) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large. Max size ${utils.getFileSizeMB(MAX_FILE_SIZE)}MB`);
      return;
    }

    try {
      setIsUploading(true);
      toast.loading(`Uploading ${type}...`, { id: 'upload' });

      const result = await fileAPI.upload(file);
      if (result.success) {
        setUploadedFiles(prev => ({ ...prev, [type]: { file, hash: result.ipfs_hash, url: result.file_url } }));
        setFormData(prev => ({ ...prev, [`ipfs${type.charAt(0).toUpperCase() + type.slice(1)}Hash`]: result.ipfs_hash }));
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded!`, { id: 'upload' });
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Upload failed', { id: 'upload' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file, type);
  };

  const removeFile = (type) => {
    setUploadedFiles(prev => ({ ...prev, [type]: null }));
    setFormData(prev => ({ ...prev, [`ipfs${type.charAt(0).toUpperCase() + type.slice(1)}Hash`]: '' }));
  };

  const validateFormData = () => {
    // Simple validation
    if (!formData.name.trim()) {
      toast.error('Crop name is required');
      return false;
    }
    if (!formData.batchNumber.trim()) {
      toast.error('Batch number is required');
      return false;
    }
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      toast.error('Valid quantity is required');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Valid price is required');
      return false;
    }
    if (!formData.harvestDate) {
      toast.error('Harvest date is required');
      return false;
    }
    if (!formData.expiryDate) {
      toast.error('Expiry date is required');
      return false;
    }
    if (!formData.farmCoords.trim()) {
      toast.error('Farm coordinates are required');
      return false;
    }
    return true;
  };

  // Handle crop registration submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFormData()) return;

    try {
      setIsSubmitting(true);

      // Initialize blockchain connection
      await blockchainService.initialize();
      
      const account = blockchainService.getAccount();
      if (!account) throw new Error('No Ethereum account connected');

      // Check if user profile exists
      const profile = await userAPI.getProfile(account);
      if (!profile || !profile.address) throw new Error('You are not registered. Please register first.');
      if (profile.role.toLowerCase() !== 'farmer') throw new Error('Only farmers can register crops');

      const cropData = {
        name: formData.name,
        quantity: parseInt(formData.quantity),
        price: utils.toWei(parseFloat(formData.price)),
        batchNumber: formData.batchNumber,
        harvestDate: Math.floor(new Date(formData.harvestDate).getTime() / 1000),
        expiryDate: Math.floor(new Date(formData.expiryDate).getTime() / 1000),
        farmCoords: formData.farmCoords,
        ipfsImageHash: formData.ipfsImageHash || "",
        ipfsCertHash: formData.ipfsCertHash || ""
      };

      // Register crop on blockchain using MetaMask
      toast.loading('Registering crop on blockchain...', { id: 'register' });
      const txResult = await blockchainService.registerCrop(cropData);
      
      toast.success('Crop registered successfully!', { id: 'register' });
      console.log('Transaction hash:', txResult.hash);
      
      // Navigate to farmer dashboard
      navigate('/farmer/crops');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // File upload UI component
  const FileUploadArea = ({ type, label, icon: Icon }) => {
    const file = uploadedFiles[type];
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {file ? (
          <div className="border border-green-200 bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">{file.file.name}</p>
                  <p className="text-xs text-green-600">{utils.getFileSizeMB(file.file.size)}MB • Uploaded to IPFS</p>
                </div>
              </div>
              <button type="button" onClick={() => removeFile(type)} className="text-red-600 hover:text-red-800">
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept={type === 'image' ? 'image/*' : '.pdf,.doc,.docx'}
              onChange={(e) => handleFileChange(e, type)}
              className="hidden"
              id={`file-${type}`}
              disabled={isUploading}
            />
            <label htmlFor={`file-${type}`} className="cursor-pointer">
              <Icon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload {label.toLowerCase()}</p>
              <p className="text-xs text-gray-500 mt-1">Max {utils.getFileSizeMB(MAX_FILE_SIZE)}MB</p>
            </label>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Register New Crop</h1>
        <p className="text-gray-600">Add a new crop to the blockchain with complete traceability</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Package className="w-5 h-5 mr-2" /> Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Crop Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Organic Tomatoes"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number *</label>
              <input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleInputChange}
                placeholder="e.g., BATCH-2024-001"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="Number of units"
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (ETH) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.1"
                required
                min="0"
                step="0.001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2" /> Important Dates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Harvest Date *</label>
              <input
                type="date"
                name="harvestDate"
                value={formData.harvestDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <MapPin className="w-5 h-5 mr-2" /> Farm Location
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GPS Coordinates *</label>
            <input
              type="text"
              name="farmCoords"
              value={formData.farmCoords}
              onChange={handleInputChange}
              placeholder="e.g., 12.9716,77.5946"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">Enter coordinates in format: latitude,longitude</p>
          </div>
        </div>

        {/* File Uploads */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Upload className="w-5 h-5 mr-2" /> Documents & Images
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUploadArea type="image" label="Crop Image" icon={Image} />
            <FileUploadArea type="certificate" label="Quality Certificate" icon={FileText} />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => navigate('/farmer/crops')} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={isSubmitting || isUploading} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? 'Registering...' : 'Register Crop'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CropRegistration;
