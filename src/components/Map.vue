<template>
    <div id="map" style="height: 500px;"></div>
</template>
  

  <script setup>
  import { onMounted, watch, ref } from 'vue';
  import 'leaflet/dist/leaflet.css';
  import L from 'leaflet';
  
  const props = defineProps({
    markers: {
      type: Array,
      required: true
    }
  });
  
  let map = null;
  let leafletMarkers = [];
  
  onMounted(() => {
    map = L.map('map').setView([42.030761, 11.909473], 13);
    
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
  
    updateMarkers(props.markers);
  });
  


  watch(() => props.markers, (newMarkers) => {
    updateMarkers(newMarkers);
  }, { deep: true });
  

  
  function updateMarkers(markers) {
    leafletMarkers.forEach(m => map.removeLayer(m));
    leafletMarkers = [];
  
    markers.forEach(m => {
        const popupContent = 
        `
  <div id="ppopcontent" style="max-width: 250px; font-size: 12px; background: white; color: black;">
    <div class="row"><span class="label">Buoy:</span> <span class="value">${m.rowData[0]}</span></div>
    <div class="row"><span class="label">Timestamp:</span> <span class="value">${m.rowData[1]}</span></div>
    <div class="row"><span class="label">Temp (°C):</span> <span class="value">${m.rowData[2]}</span></div>
    <div class="row"><span class="label">Salinity:</span> <span class="value">${m.rowData[3]}</span></div>
    <div class="row"><span class="label">Depth (m):</span> <span class="value">${m.rowData[4]}</span></div>
  </div>

    `;
    
      const marker = L.marker([m.lat, m.lng]).addTo(map).bindPopup(popupContent);
      leafletMarkers.push(marker);
    });
  }
  </script>


