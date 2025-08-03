// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const PORT = 4000;

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ MongoDB Connection
const MONGO_URI = "mongodb://127.0.0.1:27017/scamHeatmap";
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Schema & Model
const reportSchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: { type: String, required: true },
  contactInfo: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String }, // ✅ New field
  latitude: Number,
  longitude: Number,
  createdAt: { type: Date, default: Date.now },
});

const Report = mongoose.model("Report", reportSchema);

// ✅ Reverse Geocode Helper
const API_KEY = "YOUR_GOOGLE_MAPS_KEY"; // Replace with real key
async function getReadableAddress(lat, lng) {
  try {
    const res = await axios.get(
      `https://maps.gomaps.pro/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`
    );
    if (res.data.results.length > 0) {
      const formatted = res.data.results[0].formatted_address;
      const cityComponent = res.data.results[0].address_components.find((c) =>
        c.types.includes("locality")
      );
      return {
        address: formatted,
        city: cityComponent ? cityComponent.long_name : "",
      };
    }
  } catch (error) {
    console.error("Reverse geocode failed:", error.message);
  }
  return { address: "Unknown Location", city: "" };
}

// ✅ Middleware to auto-fill address/city if missing
async function ensureAddress(req, res, next) {
  if (!req.body.address && req.body.latitude && req.body.longitude) {
    const { address, city } = await getReadableAddress(
      req.body.latitude,
      req.body.longitude
    );
    req.body.address = address;
    req.body.city = city;
  }
  next();
}

// ✅ API Routes

// 1. Submit new report
app.post("/reports", ensureAddress, async (req, res) => {
  try {
    const report = new Report(req.body);
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: "Error saving report", error });
  }
});

// 2. Get all reports (auto-fix old missing addresses)
app.get("/reports", async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });

    // ✅ Fix old records missing address
    for (const r of reports) {
      if (!r.address && r.latitude && r.longitude) {
        const { address, city } = await getReadableAddress(
          r.latitude,
          r.longitude
        );
        r.address = address;
        r.city = city;
        await r.save();
      }
    }

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error });
  }
});

// 3. Get report by ID
app.get("/reports/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Error fetching report", error });
  }
});

// 4. Delete a report
app.delete("/reports/:id", async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting report", error });
  }
});

// ✅ Start server
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
