import { ethers } from "ethers";

let provider;
let signer;

export async function connectWallet() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      const account = await signer.getAddress();
      console.log("Connected wallet:", account);
      return { provider, signer, account };
    } catch (err) {
      console.error("User rejected connection:", err);
    }
  } else {
    alert("Please install MetaMask!");
  }
}

export { provider, signer };
