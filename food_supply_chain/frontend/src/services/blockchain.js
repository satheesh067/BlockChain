import { ethers } from "ethers";
import CropRegistry from "../../artifacts/contracts/CropRegistry.sol/CropRegistry.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export async function getContract() {
  if (!window.ethereum) throw new Error("MetaMask not installed");
  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, CropRegistry.abi, signer);
}
