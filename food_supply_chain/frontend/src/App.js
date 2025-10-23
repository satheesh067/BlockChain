import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { User, LogOut, Menu, X, Bell } from "lucide-react";

// Import pages
import Marketplace from "./pages/Marketplace";
import UserRegistration from "./pages/UserRegistration";
import {
  FarmerDashboard,
  DistributorDashboard,
  RetailerDashboard,
  CustomerDashboard,
  CropDetails,
  SupplyChainTracking,
  CropRegistration
} from "./pages/index";

// Import services
import blockchainService from "./services/enhanced-blockchain";
import { userAPI } from "./services/enhanced-api";
import notificationService from "./services/notification-service";
import { USER_ROLES } from "./config";

// Import components
import NotificationCenter from "./components/NotificationCenter";
import ErrorBoundary from "./components/ErrorBoundary";

// Import components
import LoadingSpinner from "./components/LoadingSpinner";
import ConnectWallet from "./components/ConnectWallet";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

  // Initialize blockchain connection
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      console.log("Initializing app...");
      
      // Check if MetaMask is available
      if (!window.ethereum) {
        console.log("MetaMask not detected");
        setIsConnected(false);
        setIsLoading(false);
        return;
      }
      
      // Initialize blockchain service
      console.log("Initializing blockchain service...");
      const blockchainResult = await blockchainService.initialize();
      console.log("Blockchain result:", blockchainResult);
      
      if (blockchainResult.success) {
        console.log("Blockchain connected successfully");
        setIsConnected(true);
        setCurrentAccount(blockchainResult.account);
        
        // Try to get user profile
        try {
          console.log("Fetching user profile...");
          const profile = await userAPI.getProfile(blockchainResult.account);
          console.log("User profile found:", profile);
          setUserProfile(profile);
          
          // Initialize notifications with user role
          await initializeNotifications(blockchainResult.account, profile.role);
        } catch (error) {
          console.log("User profile not found, will need registration:", error);
          
          // Set a default profile to show registration options
          setUserProfile({
            address: blockchainResult.account,
            name: "New User",
            email: "",
            role: null, // No role assigned yet
            needsRegistration: true
          });
          
          // Initialize notifications without role
          await initializeNotifications(blockchainResult.account, null);
        }
      } else {
        console.log("Blockchain connection failed:", blockchainResult.error);
        setIsConnected(false);
      }
    } catch (error) {
      console.error("Failed to initialize app:", error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    await initializeApp();
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setUserProfile(null);
    setCurrentAccount(null);
  };

  const initializeNotifications = async (account, role) => {
    try {
      // Connect to WebSocket
      notificationService.connect();
      
      // Subscribe to blockchain events if contract is available
      const contract = await blockchainService.getContract();
      if (contract) {
        await notificationService.subscribeToBlockchainEvents(contract, account);
      }
      
      console.log('Notifications initialized for', account, 'with role', role);
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  };

  const handleUserRegistered = (profile) => {
    setUserProfile(profile);
    
    // Re-initialize notifications with new role
    if (currentAccount) {
      initializeNotifications(currentAccount, profile.role);
    }
  };

  const getDashboardComponent = () => {
    if (!userProfile) return <UserRegistration onRegistered={handleUserRegistered} />;
    
    // If user needs registration, show registration component
    if (userProfile.needsRegistration || !userProfile.role) {
      return <UserRegistration onRegistered={handleUserRegistered} />;
    }
    
    switch (userProfile.role) {
      case USER_ROLES.FARMER:
        return <FarmerDashboard userProfile={userProfile} />;
      case USER_ROLES.DISTRIBUTOR:
        return <DistributorDashboard userProfile={userProfile} />;
      case USER_ROLES.RETAILER:
        return <RetailerDashboard userProfile={userProfile} />;
      case USER_ROLES.CUSTOMER:
        return <CustomerDashboard userProfile={userProfile} />;
      default:
        return <Marketplace />;
    }
  };

  const getNavigationItems = () => {
    const baseItems = [
      { name: "Dashboard", path: "/", icon: "🏠" },
      { name: "Marketplace", path: "/marketplace", icon: "🏪" },
    ];

    if (userProfile) {
      // If user needs registration, show registration options
      if (userProfile.needsRegistration || !userProfile.role) {
        return [
          ...baseItems,
          { name: "Register Account", path: "/register", icon: "👤" },
          { name: "User Registration", path: "/register", icon: "📝" },
        ];
      }

      switch (userProfile.role) {
        case USER_ROLES.FARMER:
          return [
            ...baseItems,
            { name: "My Crops", path: "/farmer/crops", icon: "🌾" },
            { name: "Register Crop", path: "/farmer/register", icon: "➕" },
            { name: "Analytics", path: "/farmer/analytics", icon: "📊" },
          ];
        case USER_ROLES.DISTRIBUTOR:
          return [
            ...baseItems,
            { name: "Inventory", path: "/distributor/inventory", icon: "📦" },
            { name: "Transfers", path: "/distributor/transfers", icon: "🔄" },
          ];
        case USER_ROLES.RETAILER:
          return [
            ...baseItems,
            { name: "Store", path: "/retailer/store", icon: "🏬" },
            { name: "Orders", path: "/retailer/orders", icon: "📋" },
          ];
        case USER_ROLES.CUSTOMER:
          return [
            ...baseItems,
            { name: "My Orders", path: "/customer/orders", icon: "🛒" },
            { name: "Scan QR", path: "/customer/scan", icon: "📱" },
          ];
        default:
          return baseItems;
      }
    }

    return baseItems;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <ConnectWallet onConnect={handleConnectWallet} />
          
          {/* Temporary bypass for testing */}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-700 mb-2">
              <strong>For Testing:</strong> If you don't have MetaMask or want to test without connecting:
            </p>
            <button
              onClick={() => {
                setIsConnected(true);
                setCurrentAccount("0x1234567890123456789012345678901234567890");
                setUserProfile({
                  address: "0x1234567890123456789012345678901234567890",
                  name: "Test User",
                  email: "test@example.com",
                  role: "farmer"
                });
              }}
              className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors text-sm"
            >
              Skip Connection (Test Mode)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
        
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <h1 className="text-xl font-bold text-green-600 ml-2">
                  🌾 Food Supply Chain
                </h1>
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-4">
                {/* Notification Bell */}
                <button
                  onClick={() => setNotificationCenterOpen(true)}
                  className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <Bell size={20} />
                  {/* Notification badge would go here */}
                </button>
                
                {userProfile && (
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">{userProfile.name || "User"}</div>
                      <div className="text-xs text-gray-400 capitalize">
                        {userProfile.needsRegistration ? "Needs Registration" : userProfile.role || "No Role"}
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      userProfile.needsRegistration ? 'bg-yellow-100' : 'bg-green-100'
                    }`}>
                      <User size={16} className={userProfile.needsRegistration ? 'text-yellow-600' : 'text-green-600'} />
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleDisconnect}
                  className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
                >
                  <LogOut size={16} />
                  <span className="text-sm">Disconnect</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-64 bg-white shadow-sm min-h-screen`}>
            <nav className="mt-5 px-2">
              <div className="space-y-1">
                {getNavigationItems().map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Routes>
              <Route path="/" element={userProfile ? getDashboardComponent() : <Marketplace />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/dashboard" element={getDashboardComponent()} />
              <Route path="/farmer/*" element={<FarmerDashboard userProfile={userProfile} />} />
              <Route path="/distributor/*" element={<DistributorDashboard userProfile={userProfile} />} />
              <Route path="/retailer/*" element={<RetailerDashboard userProfile={userProfile} />} />
              <Route path="/customer/*" element={<CustomerDashboard userProfile={userProfile} />} />
              <Route path="/crop/:id" element={<CropDetails />} />
              <Route path="/track/:id" element={<SupplyChainTracking />} />
              <Route path="/register" element={<UserRegistration onRegistered={handleUserRegistered} />} />
              <Route path="/farmer/register" element={<CropRegistration />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </div>
      
      {/* Notification Center */}
      <NotificationCenter 
        isOpen={notificationCenterOpen} 
        onClose={() => setNotificationCenterOpen(false)} 
      />
    </Router>
    </ErrorBoundary>
  );
}

export default App;