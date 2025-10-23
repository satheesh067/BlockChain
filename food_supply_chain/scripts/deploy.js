const hre = require("hardhat");

async function main() {
  // Use the correct contract name
  const FoodSupplyChain = await hre.ethers.getContractFactory("FoodSupplyChain");
  
  // Deploy contract (no need to call .deployed() in Ethers v6)
  const foodSupplyChain = await FoodSupplyChain.deploy();
  
  console.log("FoodSupplyChain deployed to:", foodSupplyChain.target); // `target` holds the deployed address in v6
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
