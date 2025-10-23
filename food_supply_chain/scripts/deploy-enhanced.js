const hre = require("hardhat");

async function main() {
  console.log("Deploying Enhanced Food Supply Chain contract...");
  
  // Deploy the enhanced contract
  const EnhancedFoodSupplyChain = await hre.ethers.getContractFactory("EnhancedFoodSupplyChain");
  const enhancedContract = await EnhancedFoodSupplyChain.deploy();
  
  await enhancedContract.waitForDeployment();
  
  const contractAddress = await enhancedContract.getAddress();
  
  console.log("Enhanced Food Supply Chain deployed to:", contractAddress);
  
  // Grant initial roles to deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  // Grant roles to deployer for testing
  console.log("Granting roles to deployer...");
  await enhancedContract.grantFarmerRole(deployer.address);
  await enhancedContract.grantDistributorRole(deployer.address);
  await enhancedContract.grantRetailerRole(deployer.address);
  await enhancedContract.grantCustomerRole(deployer.address);
  
  console.log("All roles granted to deployer for testing");
  
  // Test registration of a sample crop
  console.log("Registering sample crop...");
  const tx = await enhancedContract.registerCrop(
    "Organic Tomatoes",
    100,
    hre.ethers.parseEther("0.1"), // 0.1 ETH
    "BATCH-001",
    Math.floor(Date.now() / 1000), // Current timestamp
    Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days from now
    "QmSampleImageHash",
    "QmSampleCertHash",
    "12.9716,77.5946" // Bangalore coordinates
  );
  
  await tx.wait();
  console.log("Sample crop registered successfully!");
  
  console.log("\n=== Deployment Summary ===");
  console.log("Contract Address:", contractAddress);
  console.log("Deployer Address:", deployer.address);
  console.log("Network:", hre.network.name);
  console.log("Block Number:", await hre.ethers.provider.getBlockNumber());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
