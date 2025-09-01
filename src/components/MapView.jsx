import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import styles from "./MapView.module.css";
import locationMarker from "../assets/marker.svg"; // custom marker icon

// Helper to check valid coordinates
const isValidLatLng = (lat, lng) =>
  typeof lat === "number" &&
  typeof lng === "number" &&
  lat >= -90 &&
  lat <= 90 &&
  lng >= -180 &&
  lng <= 180;

// Component to auto-fit bounds when members change (but only once per change)
function FitBoundsOnce({ members }) {
  const map = useMap();
  const lastMembersRef = useRef([]);

  useEffect(() => {
    if (!members.length) return;

    // Check if members actually changed (lat/lng or list length)
    const prev = lastMembersRef.current;
    const changed =
      prev.length !== members.length ||
      members.some(
        (m, i) =>
          !prev[i] ||
          m.lat !== prev[i].lat ||
          m.lng !== prev[i].lng ||
          m.name !== prev[i].name
      );

    if (changed) {
      const bounds = [];
      members.forEach((m) => {
        if (isValidLatLng(m.lat, m.lng)) {
          bounds.push([m.lat, m.lng]);
        }
      });

      if (bounds.length > 0) {
        // 🎯 Smooth transition instead of jump
        map.flyToBounds(bounds, {
          padding: [50, 50],
          animate: true,
          duration: 2.0, // seconds
        });
      }

      lastMembersRef.current = members;
    }
  }, [members, map]);

  return null;
}

export default function MapView({ members }) {
  const defaultCenter = [28.61, 77.2]; // Delhi fallback

  const customIcon = L.icon({
    iconUrl: locationMarker,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });

  return (
    <div className={styles.map}>
      <MapContainer
        center={defaultCenter}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {members.map(
          (m, i) =>
            isValidLatLng(m.lat, m.lng) && (
              <Marker
                key={i}
                position={[m.lat, m.lng]}
                icon={customIcon}
                title={m.name}
              >
                <Popup>
                  <strong>{m.name}</strong> <br />
                  📍 {m.lat}, {m.lng}
                  {m.timestamp && (
                    <>
                      <br />
                      ⏰ {new Date(m.timestamp).toLocaleString()}
                    </>
                  )}
                </Popup>
              </Marker>
            )
        )}

        {/* Auto-fit once when members update */}
        <FitBoundsOnce members={members} />
      </MapContainer>
    </div>
  );
}
