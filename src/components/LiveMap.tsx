'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom inline SVG data URL icon to guarantee it renders perfectly without relative asset bundling issues
// Custom inline SVG data URL icon to guarantee it renders perfectly without relative asset bundling issues
const medicalCrossIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2306b6d4" stroke="%23ffffff" stroke-width="1.5" width="40" height="40"><circle cx="12" cy="12" r="10" fill="%230a0f26" stroke="%2306b6d4" stroke-width="2"/><path d="M12 7v10M7 12h10" stroke="%2306b6d4" stroke-width="3" stroke-linecap="round"/></svg>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const hospitalIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23f43f5e" stroke="%23ffffff" stroke-width="1.5" width="40" height="40"><circle cx="12" cy="12" r="10" fill="%230a0f26" stroke="%23f43f5e" stroke-width="2"/><path d="M12 7v10M7 12h10" stroke="%23f43f5e" stroke-width="3" stroke-linecap="round"/></svg>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const userIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233b82f6" stroke="%23ffffff" stroke-width="1.5" width="30" height="30"><circle cx="12" cy="12" r="8" fill="%233b82f6" stroke="%23ffffff" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="%23ffffff"/></svg>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

// Component to dynamically re-center the map when coordinates update
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface LiveMapProps {
  lat: number;
  lng: number;
  driverName?: string;
  vehicleNumber?: string;
  hospitalLat?: number;
  hospitalLng?: number;
  hospitalName?: string;
  userLat?: number;
  userLng?: number;
}

export default function LiveMap({ 
  lat, 
  lng, 
  driverName = "Driver", 
  vehicleNumber = "MH-01-AX-1234",
  hospitalLat,
  hospitalLng,
  hospitalName = "Hospital",
  userLat,
  userLng
}: LiveMapProps) {
  const position: [number, number] = [lat, lng];

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden border border-white/[0.05] shadow-lg relative z-0">
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={position} />
        
        {/* Ambulance Marker */}
        <Marker position={position} icon={medicalCrossIcon}>
          <Popup>
            <div className="text-slate-800 font-sans p-1">
              <div className="font-bold text-xs uppercase tracking-wide">Ambulance {vehicleNumber}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Driver: {driverName}</div>
              <div className="text-[9px] font-mono text-emerald-600 mt-1">Status: Active Telemetry</div>
            </div>
          </Popup>
        </Marker>

        {/* Selected Hospital Marker */}
        {hospitalLat && hospitalLng && (
          <Marker position={[hospitalLat, hospitalLng]} icon={hospitalIcon}>
            <Popup>
              <div className="text-slate-800 font-sans p-1">
                <div className="font-bold text-xs uppercase tracking-wide text-rose-600">🏥 {hospitalName}</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Target Destination Hospital</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* User GPS Position Marker */}
        {userLat && userLng && (
          <Marker position={[userLat, userLng]} icon={userIcon}>
            <Popup>
              <div className="text-slate-800 font-sans p-1">
                <div className="font-bold text-xs text-blue-600">📍 You Are Here</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Detected GPS Coordinates</div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
