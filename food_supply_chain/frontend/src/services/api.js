import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";

let provider;
if (window.ethereum) {
  provider = new ethers.providers.Web3Provider(window.ethereum);
} else {
  alert("Install MetaMask!");
}

const signer = provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

export async function registerCrop(name, quantity, price) {
  const tx = await contract.registerCrop(name, quantity, price);
  await tx.wait();
  return tx;
}

export async function buyCrop(id, price) {
  const tx = await contract.buyCrop(id, { value: price });
  await tx.wait();
  return tx;
}

export async function getCrop(id) {
  return await contract.getCrop(id);
}
