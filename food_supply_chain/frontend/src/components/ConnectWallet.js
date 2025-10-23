import React from 'react';
import { Wallet, AlertCircle } from 'lucide-react';

const ConnectWallet = ({ onConnect }) => {
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <Wallet className="h-6 w-6 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Connect Your Wallet
        </h2>
        
        <p className="text-gray-600 mb-6">
          Connect your MetaMask wallet to access the Food Supply Chain platform
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Make sure you're connected to:</p>
              <p>• Network: Hardhat Local</p>
              <p>• Chain ID: 31337</p>
              <p>• RPC URL: http://127.0.0.1:8545</p>
            </div>
          </div>
        </div>

        <button
          onClick={onConnect}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-medium"
        >
          Connect MetaMask
        </button>

        <div className="mt-6 text-xs text-gray-500">
          <p>Don't have MetaMask? <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Download here</a></p>
        </div>
      </div>
    </div>
  );
};

export default ConnectWallet;
