import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import styles from "./MapView.module.css";
import locationMarker from "../assets/marker.svg"; // custom marker icon

// ✅ Helper: validate coordinates
const isValidLatLng = (lat, lng) =>
  typeof lat === "number" &&
  typeof lng === "number" &&
  lat >= -90 &&
  lat <= 90 &&
  lng >= -180 &&
  lng <= 180;

// ✅ Animated Marker component
function AnimatedMarker({ member, icon, onOutOfBounds }) {
  const map = useMap();
  const markerRef = useRef(null);

  useEffect(() => {
    if (!isValidLatLng(member.lat, member.lng)) return;

    const targetPos = L.latLng(member.lat, member.lng);

    // First render → create marker
    if (!markerRef.current) {
      markerRef.current = L.marker(targetPos, { icon })
        .addTo(map)
        .bindPopup(
          `<strong>${member.name}</strong><br/>
           📍 ${member.lat}, ${member.lng}
           ${
             member.timestamp
               ? `<br/>⏰ ${new Date(member.timestamp).toLocaleString()}`
               : ""
           }`
        );
      return;
    }

    const marker = markerRef.current;
    const startPos = marker.getLatLng();
    const duration = 1000; // 1 second
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      const newLat =
        startPos.lat + (targetPos.lat - startPos.lat) * progress;
      const newLng =
        startPos.lng + (targetPos.lng - startPos.lng) * progress;

      marker.setLatLng([newLat, newLng]);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);

    // Update popup content
    marker.setPopupContent(
      `<strong>${member.name}</strong><br/>
       📍 ${member.lat}, ${member.lng}
       ${
         member.timestamp
           ? `<br/>⏰ ${new Date(member.timestamp).toLocaleString()}`
           : ""
       }`
    );

    // ✅ Check if marker is outside current bounds
    if (!map.getBounds().contains(targetPos)) {
      onOutOfBounds(targetPos); // tell parent
    }
  }, [member, map, icon, onOutOfBounds]);

  return null; // Leaflet manages the DOM
}

// ✅ Fit all members into view initially, and later only when needed
function FitBoundsController({ members }) {
  const map = useMap();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!members.length) return;

    const bounds = [];
    members.forEach((m) => {
      if (isValidLatLng(m.lat, m.lng)) {
        bounds.push([m.lat, m.lng]);
      }
    });

    if (bounds.length > 0 && !initializedRef.current) {
      // Fit once initially
      map.fitBounds(bounds, { padding: [50, 50] });
      initializedRef.current = true;
    }
  }, [members, map]);

  return null;
}

export default function MapView({ members }) {
  const defaultCenter = [28.61, 77.2]; // Delhi fallback
  const mapRef = useRef(null);

  const customIcon = L.icon({
    iconUrl: locationMarker,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });

  const handleOutOfBounds = (pos) => {
    if (mapRef.current) {
      mapRef.current.flyTo(pos, mapRef.current.getZoom(), {
        animate: true,
        duration: 1.5,
      });
    }
  };

  return (
    <MapContainer
      center={defaultCenter}
      zoom={5}
      className={styles.map}
      whenCreated={(mapInstance) => {
        mapRef.current = mapInstance;
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Fit all members initially */}
      <FitBoundsController members={members} />

      {/* One AnimatedMarker per member */}
      {members.map((m, i) => (
        <AnimatedMarker
          key={m.name || i}
          member={m}
          icon={customIcon}
          onOutOfBounds={handleOutOfBounds}
        />
      ))}
    </MapContainer>
  );
}
