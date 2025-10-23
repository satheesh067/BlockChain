import React, { useState } from "react";
import { registerCrop } from "../services/api";

export default function CropUpload() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [harvestDays, setHarvestDays] = useState(7);
  const [priceWei, setPriceWei] = useState("1000000000000000"); // default 0.001 ETH
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", name);
      data.append("quantity", quantity);
      data.append("harvest_days", harvestDays);
      data.append("price_wei", priceWei);
      if (file) data.append("image", file);

      const result = await registerCrop(data);
      alert("Registered: " + JSON.stringify(result));
    } catch (err) {
      console.error(err);
      alert("Error: " + (err?.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 480 }}>
      <input placeholder="Crop name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
      <input type="number" placeholder="Harvest days" value={harvestDays} onChange={(e) => setHarvestDays(e.target.value)} required />
      <input placeholder="Price (wei)" value={priceWei} onChange={(e) => setPriceWei(e.target.value)} required />
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
      <button type="submit" disabled={loading}>{loading ? "Submitting..." : "Register Crop"}</button>
    </form>
  );
}
