// ✅ Animated Marker component
function AnimatedMarker({ member, icon }) {
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

    // ✅ If marker goes out of bounds → pan map
    if (!map.getBounds().contains(targetPos)) {
      map.flyTo(targetPos, map.getZoom(), {
        animate: true,
        duration: 1.5,
      });
    }
  }, [member, map, icon]);

  return null; // Leaflet manages the DOM
}
