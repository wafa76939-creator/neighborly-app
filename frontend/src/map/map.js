const maps = new Set();

export const destroyMaps = () => {
  maps.forEach((map) => map.remove());
  maps.clear();
};

const pinIcon = (report, isHotspot) =>
  L.divIcon({
    className: 'custom-pin',
    html: `<div class="pin ${isHotspot ? 'hot' : report.category}"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 18],
  });

export const createMap = (elementId, options = {}) => {
  const map = L.map(elementId, { scrollWheelZoom: true }).setView(
    options.center || [40.713, -74.006],
    options.zoom || 15
  );
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
  }).addTo(map);
  maps.add(map);
  setTimeout(() => map.invalidateSize(), 80);
  return map;
};

export const addClusteredReports = (map, reports, hotspotSet = new Set()) => {
  const cluster = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 48 });
  const bounds = [];
  reports.forEach((report) => {
    if (!report.location) return;
    const hot = hotspotSet.has(report.normalizedAddress);
    const marker = L.marker([report.location.lat, report.location.lng], {
      icon: pinIcon(report, hot),
    });
    marker.bindPopup(`
      <strong>${report.title}</strong><br>
      ${report.category} · ${report.status}<br>
      ${report.address}<br>
      ${report.upvoteCount || 0} same here<br>
      <a href="#/issue/${report._id}">View issue</a>
    `);
    cluster.addLayer(marker);
    bounds.push([report.location.lat, report.location.lng]);
  });
  map.addLayer(cluster);
  if (bounds.length) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 16 });
  return cluster;
};

export const addPicker = (map, onChange, start) => {
  const latlng = start || map.getCenter();
  const marker = L.marker(latlng, { draggable: true }).addTo(map);
  const emit = () => {
    const pos = marker.getLatLng();
    onChange(pos.lat, pos.lng);
  };
  marker.on('dragend', emit);
  map.on('click', (e) => {
    marker.setLatLng(e.latlng);
    emit();
  });
  emit();
  return marker;
};
