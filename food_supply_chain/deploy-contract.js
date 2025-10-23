const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Enhanced Food Supply Chain contract...");
  
  // Deploy the enhanced contract
  const EnhancedFoodSupplyChain = await hre.ethers.getContractFactory("EnhancedFoodSupplyChain");
  const enhancedContract = await EnhancedFoodSupplyChain.deploy();
  
  await enhancedContract.waitForDeployment();
  
  const contractAddress = await enhancedContract.getAddress();
  
  console.log("✅ Enhanced Food Supply Chain deployed to:", contractAddress);
  
  // Grant initial roles to deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deployer address:", deployer.address);
  
  // Grant roles to deployer for testing
  console.log("🔐 Granting roles to deployer...");
  await enhancedContract.grantFarmerRole(deployer.address);
  await enhancedContract.grantDistributorRole(deployer.address);
  await enhancedContract.grantRetailerRole(deployer.address);
  await enhancedContract.grantCustomerRole(deployer.address);
  
  console.log("✅ All roles granted to deployer for testing");
  
  // Test registration of a sample crop
  console.log("🌱 Registering sample crop...");
  const sampleCropTx = await enhancedContract.registerCrop(
    "Sample Organic Tomatoes",
    100,
    hre.ethers.parseEther("0.1"), // 0.1 ETH
    "BATCH-2024-001",
    Math.floor(Date.now() / 1000), // Current timestamp
    Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
    "",
    "",
    "12.9716,77.5946"
  );
  
  await sampleCropTx.wait();
  console.log("✅ Sample crop registered successfully");
  
  console.log("\n📋 IMPORTANT: Update your backend config with this address:");
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);
  console.log("\n📁 Update this file: food_supply_chain/backend/app/config.py");
  console.log(`Or set environment variable: CONTRACT_ADDRESS=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
